import React, { useState, useCallback } from 'react'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonConfirmed, ButtonError } from '../Button'
import ProgressCircles from '../ProgressSteps'
import CurrencyInputPanel from '../CurrencyInputPanel'
import { TokenAmount, Pair, ChainId } from '@pangolindex/sdk'
import { useActiveWeb3React } from '../../hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { useChefContract, usePairContract, usePngContract, useStakingContract, useStaticSwapContract, useTokenContract } from '../../hooks/useContract'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { DoubleSideStakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
import { wrappedCurrencyAmount } from '../../utils/wrappedCurrency'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { LoadingView, SubmittedView } from '../ModalViews'
import { useTranslation } from 'react-i18next'
import { POOL_INDEX, STATIC_SWAP_ADDR } from '../../constants'

const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  padding-left: 20px;

  opacity: ${({ dim }) => (dim ? 0.5 : 1)};
`

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: DoubleSideStakingInfo
  userLiquidityUnstaked: TokenAmount | undefined
}

export default function SwapModal({ isOpen, onDismiss, stakingInfo, userLiquidityUnstaked }: StakingModalProps) {
  const { account, chainId, library } = useActiveWeb3React()

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, stakingInfo.stakedAmount.token, userLiquidityUnstaked)
  
  const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId)

  // let lp = new Token(ChainId.AVALANCHE, '0xf070843Ba9ed0ab85B0d15f9E8D67A5A8E073254', 18, 'JLP', 'Joe LP Token');

  let hypotheticalRewardRate: TokenAmount = new TokenAmount(stakingInfo.rewardRate.token, '0')
  if (parsedAmountWrapped?.greaterThan('0')) {
    hypotheticalRewardRate = stakingInfo.getHypotheticalRewardRate(
      stakingInfo.stakedAmount.add(parsedAmountWrapped),
      stakingInfo.totalStakedAmount.add(parsedAmountWrapped),
      stakingInfo.totalRewardRate
    )
  }

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  // pair contract for this token to be staked
  const dummyPair = new Pair(
    new TokenAmount(stakingInfo.tokens[0], '0'),
    new TokenAmount(stakingInfo.tokens[1], '0'),
    chainId ? chainId : ChainId.AVALANCHE
  )
  // const pairContract = usePairContract(dummyPair.liquidityToken.address)
  let pairContract = useStakingContract();

  // approval data for stake
  const deadline = useTransactionDeadline()
  const { t } = useTranslation()
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmount, stakingInfo.stakingRewardAddress)
  let chef = useChefContract();

  // const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)
  let stakingContract = useStakingContract();
  let staticSwapContract = useStaticSwapContract();
  let smrt = usePngContract();
  let legacySmrt = useTokenContract(`0xCC2f1d827b18321254223dF4e84dE399D9Ff116c`)
  async function onStake() {
    setAttempting(true)
    
    let amt = parseFloat(typedValue)
    if(amt && amt > 0) {

      let amtBi = BigInt(amt);
      let tfrAmt = amtBi * BigInt(10 ** 18)
      
      let signer:any = library?.getSigner()

      let res = await (await legacySmrt.approve(STATIC_SWAP_ADDR, `${tfrAmt.toString()}`)).wait()
        staticSwapContract?.swap(`${tfrAmt.toString()}`).then((response: TransactionResponse) => {
              addTransaction(response, {
                summary: "Swap complete."
              });
              setHash(response.hash);
            })
            .catch((error: any) => {
              setAttempting(false);
              console.error(error);
            })

      // });

      
    }

    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {

        // const accountArg = useMemo(() => [account ?? undefined], [account])
        // const accountArg2 = useMemo(() => [0, account ?? undefined], [account])
      // const results3 = useSingleCallResult(smrt, 'balanceOf', accountArg)
      // const results4 = useSingleCallResult(chef, 'pendingTokens', accountArg2)

      // useMemo(() => {
    
    let signer:any = library?.getSigner()

        // stakingContract
	        // .stake(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 })
          
          chef?.connect(signer).deposit(POOL_INDEX, parsedAmount.raw.toString(), 
          // { from:`0xC56B7d17A5b06B2750c75b4F31Ec4985325dd304`}
          )
	        .then((response: TransactionResponse) => {
		        addTransaction(response, {
			        summary: t("earn.depositLiquidity")
		        });
		        setHash(response.hash);
	        })
	        .catch((error: any) => {
		        setAttempting(false);
		        console.error(error);
	        })
      } else if (signatureData) {
        stakingContract
          .stakeWithPermit(
            `0x${parsedAmount.raw.toString(16)}`,
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s,
            { gasLimit: 350000 }
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `t('earn.depositLiquidity')`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            console.error(error)
          })
      } else {
        setAttempting(false)
        throw new Error(t('earn.attemptingToStakeError'))
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setSignatureData(null)
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  async function onAttemptToApprove() {
    if (!pairContract || !library || !deadline) throw new Error(t('earn.missingDependencies'))
    const liquidityAmount = parsedAmount
    if (!liquidityAmount) throw new Error(t('earn.missingLiquidityAmount'))

          approveCallback()
  }

  let tccc = dummyPair.tokenAmounts[0];
  tccc.currency.symbol = `AVAX`
  tccc.token.symbol = `AVAX`

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90} >
      {!attempting && !hash && (
        <ContentWrapper gap="lg" className="swap-modal">
          <RowBetween>
            <TYPE.mediumHeader>Swap SMRT -&gt; SMRTr at 1:2</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={false}
            currency={stakingInfo.stakedAmount.token}
            pair={dummyPair}
            label={'SMRTr'}
            disableCurrencySelect={true}
            customBalanceText={''}
            topAmtOverride={stakingInfo?.smrtMeta.legacySmrtBalance}
            id="stake-liquidity-token"
          />

          <RowBetween>
            <ButtonError
              disabled={false}
              error={!!error && !!parsedAmount}
              onClick={onStake}
            >
              {error ?? t('earn.deposit')}
            </ButtonError>
          </RowBetween>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Swap SMRT to SMRTr</TYPE.largeHeader>
            <TYPE.body fontSize={18}>Two wallet transactions - be patient.</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Swap Complete</TYPE.largeHeader>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
