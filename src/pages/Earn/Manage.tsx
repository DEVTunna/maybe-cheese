import React, { useCallback, useState, useMemo, useEffect } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import VideoPlayer from 'react-video-js-player';
import canAutoPlay from 'can-autoplay';
import Cookies from 'js-cookie';
import { isMobile } from 'react-device-detect'
import { JSBI, TokenAmount, CurrencyAmount, CAVAX, Token, WAVAX, ChainId } from '@pangolindex/sdk'
import { RouteComponentProps } from 'react-router-dom'
import { useCurrency } from '../../hooks/Tokens'
import { useWalletModalToggle } from '../../state/application/hooks'
import { HideSmall, TYPE } from '../../theme'
import Unmute from '../../assets/images/unmute.png'
import PaladinLogo from '../../assets/images/palinp.png'
import RugDocLogo from '../../assets/images/rd.png'
import RugDocLogo2 from '../../assets/images/rd2.png'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import { ButtonPrimary, ButtonEmpty, ButtonSecondary } from '../../components/Button'
import StakingModal from '../../components/earn/StakingModal'
import SwapModal from '../../components/earn/SwapModal'
import { useStakingInfo } from '../../state/stake/hooks'
import UnstakingModal from '../../components/earn/UnstakingModal'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useColor } from '../../hooks/useColor'
import { CountUp } from 'use-count-up'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { useTotalSupply } from '../../data/TotalSupply'
import { usePair } from '../../data/Reserves'
import usePrevious from '../../hooks/usePrevious'
import useUSDCPrice from '../../utils/useUSDCPrice'
import { BIG_INT_ZERO, PNG } from '../../constants'
import { useTranslation } from 'react-i18next'
import ProgressBar from '@ramonak/react-progress-bar'
import { useChefContract, useClaimContract, useClaimTwitterContract, useFarmData, useLegacyChefContract } from '../../hooks/useContract';
import { ApyTooltip } from '../../components/ApyTooltip'
import { Info } from 'react-feather'
import Countdown from 'react-countdown'
const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const PositionInfo = styled(AutoColumn) <{ dim: any }>`
  position: relative;
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  position: relative;
`

const StyledDataCard = styled(DataCard) <{ bgColor?: any; showBackground?: any }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
  z-index: 2;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%,  ${showBackground ? theme.black : theme.bg5} 100%) `};
`

const StyledBottomCard = styled(DataCard) <{ dim: any }>`
  background: ${({ theme }) => theme.bg3};
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  z-index: 1;
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
     flex-direction: column;
     gap: 12px;
   `};
`


// 7859385

// let creepingAprStart = 1638306839;
// let creepingAprStart = 1638206839;

export default function Manage({
  match: {
    params: { currencyIdA2, currencyIdB2, version }
  }
}: RouteComponentProps<{ currencyIdA2: string; currencyIdB2: string; version: string }>) {
  const { account, chainId, library } = useActiveWeb3React()
  let signer: any = library?.getSigner()
  let [muted, setMuted] = useState(true);

  let currencyIdA = `AVAX`
  let currencyIdB = `0xCC2f1d827b18321254223dF4e84dE399D9Ff116c`
  // get currencies and pair
  const [currencyA, currencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdB)]
  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const [, stakingTokenPair] = usePair(tokenA, tokenB)

  const stakingInfo = useStakingInfo(Number(version), stakingTokenPair)?.[0]

  const avaxPool = currencyA === CAVAX || currencyB === CAVAX

  let valueOfTotalStakedAmountInWavax: TokenAmount | undefined
  let valueOfTotalStakedAmountInUSDC: CurrencyAmount | undefined
  let backgroundColor: string
  let token: Token | undefined
  const totalSupplyOfStakingToken = useTotalSupply(stakingInfo?.stakedAmount?.token)
  const [, avaxPngTokenPair] = usePair(CAVAX, PNG[chainId ? chainId : 43114])

  if (avaxPool) {

    token = currencyA === CAVAX ? tokenB : tokenA
    const wavax = currencyA === CAVAX ? tokenA : tokenB

    // let returnOverMonth: Percent = new Percent('0')
    if (totalSupplyOfStakingToken && stakingTokenPair && wavax) {
      // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
      valueOfTotalStakedAmountInWavax = new TokenAmount(
        wavax,
        JSBI.divide(
          JSBI.multiply(
            JSBI.multiply(stakingInfo.totalStakedAmount.raw, stakingTokenPair.reserveOf(wavax).raw),
            JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
          ),
          totalSupplyOfStakingToken.raw
        )
      )
    }

    // get the USD value of staked wavax
    //usdToken = wavax
  } else {
    let png
    if (tokenA && tokenA.equals(PNG[tokenA.chainId])) {
      token = tokenB
      png = tokenA
    } else {
      token = tokenA
      png = tokenB
    }

    if (totalSupplyOfStakingToken && stakingTokenPair && avaxPngTokenPair && tokenB && png) {
      const oneToken = JSBI.BigInt(1000000000000000000)
      const avaxPngRatio = JSBI.divide(
        JSBI.multiply(oneToken, avaxPngTokenPair.reserveOf(WAVAX[tokenB.chainId]).raw),
        avaxPngTokenPair.reserveOf(png).raw
      )

      const valueOfPngInAvax = JSBI.divide(JSBI.multiply(stakingTokenPair.reserveOf(png).raw, avaxPngRatio), oneToken)

      valueOfTotalStakedAmountInWavax = new TokenAmount(
        WAVAX[tokenB.chainId],
        JSBI.divide(
          JSBI.multiply(
            JSBI.multiply(stakingInfo.totalStakedAmount.raw, valueOfPngInAvax),
            JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
          ),
          totalSupplyOfStakingToken.raw
        )
      )
    }
    //usdToken = png
  }

  // get the color of the token
  backgroundColor = useColor(token)

  const USDPrice = useUSDCPrice(WAVAX[chainId ? chainId : ChainId.AVALANCHE])

  valueOfTotalStakedAmountInUSDC = valueOfTotalStakedAmountInWavax && USDPrice?.quote(valueOfTotalStakedAmountInWavax)

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  const countUpAmount = stakingInfo?.earnedAmount?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  // const [aprStart, setAprStart] = React.useState(0);
  // useEffect(() => {
  //   console.log(`calc start state`);
  //   let creepingAprStart = 1638306839
  //   let now = Date.now() / 1000; //1638306839
  //   console.log(now);
  //   let elapsed = now - creepingAprStart
  //   console.log(elapsed);
  //   setAprStart(elapsed * .0166)
  //   console.log(aprStart);
    
  // }, [])
  // let creepingAprStart = 163830671
  // let now = Date.now() / 1000;
  // let elapsed = now - creepingAprStart
  // console.log(`elapsed ${elapsed}`);
  let aprStart = 0;
  // let creepingAprStart =     1638309432;
  let creepingAprDownStart = 1638811538;
  let aprPeak = 8400;

  if(aprStart === 0) {
    let now = Date.now() / 1000; //1638306839
    let elapsed = now - creepingAprDownStart
    aprStart = aprPeak - (elapsed * .1)
  }
  
  const [time, setTime] = useState(aprStart);
  const time2 = usePrevious(time) ?? 0
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(prevTime => prevTime - .1); // <-- Change this line!
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [time]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 1000 * 60 * 5)
  // }, []);


  const toggleWalletModal = useWalletModalToggle()
  const { t } = useTranslation()

  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  let claimContract = useClaimContract();
  let claimTwitterContract = useClaimTwitterContract();
  
  // const [apr, setApr] = useState(0);
  // const [booster, setBooster] = useState(0);
  // const [dailyRewards, setDailyRewards] = useState(0);
  // let farmDataContract = useFarmData();
  // farmDataContract?.retrieve1().then(function (res) {
  //   let apr = BigInt(res._hex)
  //   // setApr(Number(apr))
  //   setApr(1600)
  // }).catch((e)=>{
  //   console.log(`this failed`);
  //   console.log(e);
  // })
  // farmDataContract?.retrieve2().then(function (res) {
  //   let apr = BigInt(res._hex)
  //   // setDailyRewards(Number(apr))
  //   setDailyRewards(63139416)
  // }).catch((e)=>{ 
  //   console.log(e);
  // })
  // if(stakingInfo?.smrtMeta.smrtPerSec) {
  //   let daily = stakingInfo?.smrtMeta.smrtPerSec * 86400;
  //   setDailyRewards(daily)
  // }
  // farmData?.getBooster().then(function (res) {
  //   let apr = BigInt(res._hex)
  //   setBooster(Number(apr))
  // })
  // farmData?.getDailyRewards().then(function (res) {
  //   let apr = BigInt(res._hex)
  //   setDailyRewards(Number(apr))
  // })
    
  let formattedApr = 0;
  if(stakingInfo?.tvl >= 32000000) {
    formattedApr = 3200
  } else if(stakingInfo?.tvl < 16000000) {
    formattedApr = 800
  } else {
    formattedApr = 1600
  }

  let nextTvlGoal = formattedApr * 2 * 10000;
  let tvlBase = nextTvlGoal / 2;
  let currentTvl = stakingInfo?.tvl - tvlBase;
  let tvlProgress = (currentTvl / tvlBase) * 100
  tvlProgress = parseInt(tvlProgress.toFixed(1))
  if(tvlProgress < 1) {
    tvlProgress = 1
  } else {
    tvlProgress = parseInt(tvlProgress.toFixed(1))
  }

  let chef = useChefContract();
  let legacyChef = useLegacyChefContract();

  async function onWithdraw() {
    let wdAmt = stakingInfo?.stakedAmount.raw.toString()
    
    if (stakingInfo?.stakedAmount) {
      await legacyChef?.connect(signer).emergencyWithdraw(0)
        .then((response) => {
          console.log(response);
          // addTransaction(response, {
          //   summary: t('earn.withdrawDepositedLiquidity')
          // })
          // setHash(response.hash)
        })
        .catch((error: any) => {
          // setAttempting(false)
          console.log(error)
        })
    }
  }

  let player;
  let onPlayerReady = async (e, p) => {
    player = e;

    if (isMobile) {
      player.controls(true);
      setMuted(false)
    } else {
      let mutedAuto = (await canAutoPlay.video({ timeout: 1000, muted: true })).result;
      let watchedCookie = Cookies.get('watched')
      if (watchedCookie === 'true') {
        player.controls(true);
        setMuted(false)
      } else {
        player.defaultMuted(true);
        player.muted(true);
        player.play();
        Cookies.set('watched', true)
      }
    }
  }

  // @TODO: move to hooks/stakingInfo
  const [claimableAd, setClaimableAd] = useState(0)
  const [claimableDiamond, setClaimableDiamond] = useState(0)
  const [claimableTwitter, setClaimableTwitter] = useState(0)
  let toBi = (query) => {
    return JSBI.BigInt(query.result ? query.result[0]._hex: 0)
  }
  let toNum = (bi, decimals = 18) => {
    return JSBI.toNumber(JSBI.divide(bi, JSBI.BigInt(10 ** decimals)));
  }
  let airdropClaimableBalance, twitterClaimableBalance, nosellerClaimableBalance;
  claimContract?.airdropableValueAirdrop().then(function (res) {
    setClaimableAd(toNum(toBi(res)))
  })

  claimTwitterContract?.airdropableValueAirdrop().then(function (res) {
    setClaimableTwitter(toNum(toBi(res)))
  })

  claimContract?.claimableValueDiamond().then(function (res) {
    setClaimableDiamond(toNum(JSBI.BigInt(res._hex)))
  })
  const claimAirdrop = () => {
    claimContract?.claimAirdrop().then(function (res) {
    })
  }

  const claimTwitter = () => {
    claimTwitterContract?.claimAirdrop().then(function (res) {
    })
  }

  const claimDiamond = () => {
    claimContract?.claimDiamond().then(function (res) {
    })
  }

  const unmute = useCallback(() => {
    if (!player.muted()) {
      if (player.paused()) {
        player.play()
      } else {
        player.pause()
      }
    } else {
      player.muted(false)
      setMuted(false)
      player.controls(true);
      player.currentTime(0)
    }
  }, [player])

  const addToMetaMask = async () => {
    const tokenAddress = '0x6d923f688c7ff287dc3a5943caeefc994f97b290';
    const tokenSymbol = 'SMRTr';
    const tokenDecimals = 18;
    const tokenImage = 'https://smartcoin.farm/images/smrtrlogo.png';
    try {
      let eth: any = window['ethereum'];
      const wasAdded = await eth.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  const onVideoPlay = () => {
    window['_paq'].push(['trackEvent', 'Video', 'Play', '']);
  }

  const renderer = ({ days, hours, minutes, seconds }) => {
    return <span>{days}d {hours}h {minutes}m {seconds}s</span>;
  };

  let dailys = 0;
  if(stakingInfo?.smrtMeta.smrtPerSec) {
    dailys = stakingInfo?.smrtMeta.smrtPerSec * 86400
  }
  let boosterVal = 0;
  if(stakingInfo?.smrtPriceUsd) {
    if(stakingInfo?.smrtPriceUsd <= .0014) {
      boosterVal = 400;
    }
    if(stakingInfo?.smrtPriceUsd <= .0012) {
      boosterVal = 800;
    }
    formattedApr += boosterVal
  }

  const [showApy, setShowApy] = useState(false)

  return (
    <div className="mainThing">
      <div className="newthing">
        <div className="newchild">
          <h1>Want yield? Get SMRTr.</h1>
          <h2>The world's first self-feeding high APR yield farm.</h2>

          <DataRow style={{ marginBottom: '20px', marginTop: '20px', justifyContent: 'flex-start' }}>

            <ButtonPrimary
              style={{ backgroundColor: "#40444F", color: "white" }}
              padding="8px"
              borderRadius="8px"
              width="140px"
              onClick={() => window.open('https://smartcoin-tokenomics.gitbook.io/smartcoin-tokenomics/', '_blank')}
            >
              Read More
            </ButtonPrimary>
            <ButtonPrimary
                        padding="8px"
                        borderRadius="8px"
                        width="140px"
                        onClick={() => window.open('https://traderjoexyz.com/#/trade?outputCurrency=0x6d923f688c7ff287dc3a5943caeefc994f97b290', '_blank')}
                      >
                        Buy
                      </ButtonPrimary>
            <ButtonPrimary
                        padding="8px"
                        borderRadius="8px"
                        width="140px"
                        onClick={() => window.open('https://traderjoexyz.com/#/pool/0x6d923f688c7ff287dc3a5943caeefc994f97b290/AVAX', '_blank')}
                      >
                        Add Liquidity
                      </ButtonPrimary>

          </DataRow>

          {/* <div className="videoContainer">
            {muted && !isMobile &&
              <img src={Unmute} className="unmuteBtn" onClick={unmute} width="60px" />
            }
            {muted && !isMobile &&
              <div className="unmuteOverlay" onClick={unmute} />
            }
            <VideoPlayer
              controls={false}
              autoplay={false}
              src='/erv2.mp4'
              poster='/smrtrposter.png'
              className="vjs-fluid"
              onReady={onPlayerReady}
              onPlay={onVideoPlay}
            />
          </div> */}
          <a href="https://paladinsec.co/projects/smartcoin/" target="_blank"><img className={`audit`} src="https://paladinsec.co/pld/assets/audited-by-paladin-standard.svg" height="50" /></a>
          <a href="https://rugdoc.io/project/smartcoin/" target="_blank"><img className={`audit`} height={'50px'} src={RugDocLogo2} alt="logo" /></a>
          <a href="https://rugdoc.io/project/smartcoin/" target="_blank"><img className={`audit`} height={'50px'} src={RugDocLogo} alt="logo" /></a>
            
        </div>

        <div className="newchild">

          <PageWrapper gap="lg" justify="center">
          <PoolData>
              <div>
                <h3 className='no-margin-vertical countdownheader'>
                  <a href="https://medium.com/@SmartCoin/im-doxxing-myself-9148905c0eb6" target="_blank" className="whitelink">A message from our Einstein, our founder.</a>
                  {/* <span className='countdown-timer'>
                    <Countdown
                      date={new Date('December 17 2021 19:00:00 UTC')}
                      renderer={renderer}
                    />
                  </span> */}
                </h3>
              </div>
            </PoolData>
            <PoolData>
                <AutoColumn gap="sm">
                  <RowBetween>
                    <div>
                      <TYPE.black>APR</TYPE.black>
                    </div>
                  </RowBetween>
                  <RowBetween style={{ alignItems: 'baseline' }}>
                    <TYPE.largeHeader fontSize={36} fontWeight={600} className="terminated">
                      <a href="https://twitter.com/0xSmartCoin/status/1470886717657858051" target="_blank">
                        Emissions Terminated
                      </a>
                    </TYPE.largeHeader>
                  </RowBetween>
                </AutoColumn>
            </PoolData>
              <DataRow style={{ gap: '24px' }}>
                <PoolData>
                  <AutoColumn gap="sm">
                    <TYPE.body style={{ margin: 0 }}>{`TVL`}</TYPE.body>
                    <TYPE.body fontSize={22} fontWeight={500}>
                      ${stakingInfo?.tvl?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TYPE.body>
                  </AutoColumn>
                </PoolData>

                <PoolData>
                  <AutoColumn gap="sm">
                    <TYPE.black style={{ margin: 0 }}>{`SMRTr Price`}</TYPE.black>
                    <TYPE.body fontSize={22} fontWeight={500}>
                      ${stakingInfo?.smrtPriceUsd.toFixed(8)}
                    </TYPE.body>
                  </AutoColumn>
                </PoolData>

                
              </DataRow>
              <DataRow style={{ gap: '24px', position: 'relative' }}>
              <PoolData>
                  <AutoColumn gap="sm">
                    <TYPE.body style={{ margin: 0 }}>{`Daily Rewards`}</TYPE.body>
                    <TYPE.body fontSize={18} fontWeight={500}>
                      {dailys.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}&nbsp; SMRTr
                    </TYPE.body>
                  </AutoColumn>
                </PoolData>
                
                <PoolData>
                  <AutoColumn gap="sm">
                    <TYPE.black style={{ margin: 0 }}>{`Your Reward Share`}</TYPE.black>
                    <TYPE.body fontSize={24} fontWeight={500}>
                      {stakingInfo?.poolShare.toFixed(2) ?? '-'}%
                    </TYPE.body>
                  </AutoColumn>
                </PoolData>
              </DataRow>
              {showAddLiquidityButton && (
                <VoteCard>
                  <CardSection>
                    <AutoColumn gap="md">
                      <RowBetween>
                        <TYPE.white fontWeight={600}>{t('earnPage.step1')}</TYPE.white>
                      </RowBetween>
                      <RowBetween style={{ marginBottom: '1rem' }}>
                        <TYPE.white fontSize={14}>
                          {t('earnPage.pglTokenRequired', { poolHandle: currencyA?.symbol + '-' + currencyB?.symbol })}
                        </TYPE.white>
                      </RowBetween>
                      <ButtonPrimary
                        padding="8px"
                        borderRadius="8px"
                        width="140px"
                        onClick={() => window.open('https://traderjoexyz.com/#/pool/0x6d923f688c7ff287dc3a5943caeefc994f97b290/AVAX', '_blank')}
                      >
                        Add Liquidity
                      </ButtonPrimary>
                    </AutoColumn>
                  </CardSection>
                </VoteCard>
              )}
              {stakingInfo && (
                <>
                  <StakingModal
                    isOpen={showStakingModal}
                    onDismiss={() => setShowStakingModal(false)}
                    stakingInfo={stakingInfo}
                    userLiquidityUnstaked={userLiquidityUnstaked}
                  />
                  <SwapModal
                    isOpen={showSwapModal}
                    onDismiss={() => setShowSwapModal(false)}
                    stakingInfo={stakingInfo}
                    userLiquidityUnstaked={userLiquidityUnstaked}
                  />
                  <UnstakingModal
                    isOpen={showUnstakingModal}
                    onDismiss={() => setShowUnstakingModal(false)}
                    stakingInfo={stakingInfo}
                  />
                  <ClaimRewardModal
                    isOpen={showClaimRewardModal}
                    onDismiss={() => setShowClaimRewardModal(false)}
                    stakingInfo={stakingInfo}
                  />
                </>
              )}
              <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
                <BottomSection gap="lg" justify="center">
                  <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
                    <CardSection>
                      <AutoColumn gap="md">
                        <RowBetween>
                          <TYPE.white fontWeight={600}>{t('earnPage.liquidityDeposits')}</TYPE.white>
                        </RowBetween>
                        <RowBetween style={{ alignItems: 'baseline' }}>
                          <TYPE.white fontSize={36} fontWeight={600}>
                            {stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
                          </TYPE.white>
                          <TYPE.white>
                            ${stakingInfo?.lpPositionUsd.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? '-'}<br />
                            {/* {stakingInfo?.poolShare.toFixed(2) ?? '-'}% of pool */}
                          </TYPE.white>
                        </RowBetween>
                      </AutoColumn>
                    </CardSection>
                  </StyledDataCard>
                  <StyledBottomCard dim={false}>
                    <AutoColumn gap="sm">
                      <RowBetween>
                        <div>
                          <TYPE.black>{t('earnPage.unclaimedReward', { symbol: 'SMRTr' })}</TYPE.black>
                        </div>
                        {stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
                          <ButtonPrimary
                            padding="8px"
                            borderRadius="8px"
                            width="fit-content"
                            onClick={() => setShowClaimRewardModal(true)}
                          >
                            {t('earnPage.claim')}
                          </ButtonPrimary>
                        )}
                      </RowBetween>
                      <RowBetween style={{ alignItems: 'baseline' }}>
                        <TYPE.largeHeader fontSize={36} fontWeight={600}>
                          <CountUp
                            key={countUpAmount}
                            isCounting
                            decimalPlaces={4}
                            start={parseFloat(countUpAmountPrevious)}
                            end={parseFloat(countUpAmount)}
                            thousandsSeparator={','}
                            duration={1}
                          />
                        </TYPE.largeHeader>
                        <TYPE.black fontSize={16} fontWeight={500}>
                          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                            ⚡
                          </span>
                          {(stakingInfo?.usdPerDay / stakingInfo?.smrtPriceUsd).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          &nbsp; SMRTr/day (${stakingInfo?.usdPerDay.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")})
                        </TYPE.black>
                      </RowBetween>
                    </AutoColumn>
                  </StyledBottomCard>
                </BottomSection>

                {!showAddLiquidityButton && (
                  <DataRow style={{ marginBottom: '.5rem' }}>
                    <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
                      {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0))
                        ? t('earnPage.deposit')
                        : t('earnPage.depositStakingTokens', { symbol: 'LP' })}
                    </ButtonPrimary>

                    {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
                      <>
                        <ButtonSecondary
                          padding="8px"
                          borderRadius="8px"
                          width="160px"
                          onClick={() => setShowUnstakingModal(true)}
                        >
                          Withdraw
                        </ButtonSecondary>

                      </>
                    )}
                  </DataRow>
                )}
                <DataRow>
                <ButtonSecondary padding="8px" borderRadius="8px" width="160px" onClick={addToMetaMask}>
                      Add to MetaMask
                    </ButtonSecondary>
                </DataRow>
                {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : (
                  <TYPE.main>
                    {userLiquidityUnstaked.toSignificant(6)} {t('earnPage.stakingTokensAvailable', { symbol: 'LP' })}
                  </TYPE.main>
                )}
                {/* <DataRow style={{ gap: '24px' }}>
                  <PoolData>
                    <AutoColumn gap="sm">
                      <TYPE.body style={{ margin: 0 }}>{`Circulating Supply`}</TYPE.body>
                      <TYPE.body fontSize={24} fontWeight={500}>
                        {(stakingInfo?.tsNum - stakingInfo?.burnNum).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? '-'}
                      </TYPE.body>
                    </AutoColumn>
                  </PoolData>
                  <PoolData>
                    <AutoColumn gap="sm">
                      <TYPE.body style={{ margin: 0, height: 20 }}>🎁</TYPE.body>

                      <TYPE.body fontSize={24} fontWeight={500}>
                        0
                      </TYPE.body>
                    </AutoColumn>
                  </PoolData>
                </DataRow> */}

              </PositionInfo>
            
              <DataRow style={{ gap: '24px' }}>
              <PoolData>
                <AutoColumn gap="sm">
                  <TYPE.body style={{ margin: 0 }}>#noseller Reward</TYPE.body>
                  <TYPE.body fontSize={22} fontWeight={500}>
                    {claimableDiamond}
                  </TYPE.body>
                  <ButtonSecondary
                    padding="8px"
                    borderRadius="8px"
                    onClick={() => claimDiamond()}
                  >
                    Claim
                  </ButtonSecondary>
                </AutoColumn>
              </PoolData>
              <PoolData>
                <AutoColumn gap="sm">
                  <TYPE.body style={{ margin: 0 }}>Twitter Bonus</TYPE.body>
                  <TYPE.body fontSize={22} fontWeight={500}>
                    {claimableTwitter}
                  </TYPE.body>
                  <ButtonSecondary
                    padding="8px"
                    borderRadius="8px"
                    onClick={() => claimTwitter()}
                  >
                    Claim
                  </ButtonSecondary>
                </AutoColumn>
              </PoolData>
              <PoolData>
                <AutoColumn gap="sm">
                  <TYPE.body style={{ margin: 0 }}>Airdropped SMRTr</TYPE.body>
                  <TYPE.body fontSize={22} fontWeight={500}>
                    {claimableAd}
                  </TYPE.body>
                  <ButtonSecondary
                    padding="8px"
                    borderRadius="8px"
                    onClick={() => claimAirdrop()}
                  >
                    Claim
                  </ButtonSecondary>
                </AutoColumn>
              </PoolData>
            </DataRow>
            <DataRow style={{ gap: '24px', marginTop: '20px' }}>
              <PoolData>
                <AutoColumn gap="sm">
                  <TYPE.body style={{ margin: 0 }}>Missing your #nosell bonus?</TYPE.body>
                  <ButtonSecondary
                    padding="8px"
                    borderRadius="8px"
                    onClick={() => window.open('https://forms.gle/Gciu5kgHCYCB4QcQ6', '_blank')}
                  >
                    Start Here
                  </ButtonSecondary>
                </AutoColumn>
              </PoolData>
              <PoolData>
                <AutoColumn gap="sm">
                  <TYPE.body style={{ margin: 0 }}>Missing a Twitter bonus? </TYPE.body>
                  <ButtonSecondary
                    padding="8px"
                    borderRadius="8px"
                    onClick={() => window.open('https://forms.gle/qRPYGU7eM3GkvaSm6', '_blank')}
                  >
                    Start Here
                  </ButtonSecondary>
                </AutoColumn>
              </PoolData>
              <PoolData>
                <AutoColumn gap="sm">
                  <TYPE.body style={{ margin: 0 }}>Need to withdraw SMRT/AVAX LP?</TYPE.body>
                  <ButtonSecondary
                    padding="8px"
                    borderRadius="8px"
                    onClick={() => onWithdraw()}
                  >
                    Withdraw
                  </ButtonSecondary>
                </AutoColumn>
              </PoolData>
            </DataRow>
          </PageWrapper>
        </div>
      </div>
    </div >
  )
}

