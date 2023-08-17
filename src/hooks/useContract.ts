import { Contract } from '@ethersproject/contracts'
import { WAVAX } from '@pangolindex/sdk'
import { abi as IPangolinPairABI } from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/interfaces/IPangolinPair.sol/IPangolinPair.json'
import { abi as STAKING_REWARDS_ABI } from '@pangolindex/governance/artifacts/contracts/StakingRewards.sol/StakingRewards.json'
import { abi as AIRDROP_ABI } from '@pangolindex/governance/artifacts/contracts/Airdrop.sol/Airdrop.json'
import { abi as GOVERNANCE_ABI } from '@pangolindex/governance/artifacts/contracts/GovernorAlpha.sol/GovernorAlpha.json'
import { abi as PNG_ABI } from '@pangolindex/governance/artifacts/contracts/PNG.sol/Png.json'
import { chefArtifact as CHEF_ABI, claimAbi, claimAbi2, farmDataAbi, lpTokenArtifact, staticSwapAbi } from '../constants/abis/index'
import { abi as BRIDGE_MIGRATOR_ABI } from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-periphery/PangolinBridgeMigrationRouter.sol/PangolinBridgeMigrationRouter.json'
import { useMemo } from 'react'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import BRIDGE_TOKEN_ABI from '../constants/abis/bridge-token.json'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from '../constants/abis/migrator'
import WETH_ABI from '../constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { V1_EXCHANGE_ABI, V1_FACTORY_ABI, V1_FACTORY_ADDRESSES } from '../constants/v1'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'
import { AIRDROP_ADDRESS, BRIDGE_MIGRATOR_ADDRESS, CHEF_ADDR, LP_ADDR, STATIC_SWAP_ADDR } from '../constants'
import { GOVERNANCE_ADDRESS, PNG } from '../constants'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useV1FactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && V1_FACTORY_ADDRESSES[chainId], V1_FACTORY_ABI, false)
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useBridgeMigratorContract(): Contract | null {
  return useContract(BRIDGE_MIGRATOR_ADDRESS, BRIDGE_MIGRATOR_ABI, true)
}

export function useV1ExchangeContract(address?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, V1_EXCHANGE_ABI, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useBridgeTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, BRIDGE_TOKEN_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WAVAX[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IPangolinPairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useGovernanceContract(): Contract | null {
  return useContract(GOVERNANCE_ADDRESS, GOVERNANCE_ABI, true)
}

export function usePngContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? PNG[chainId].address : undefined, PNG_ABI, true)
}

export function useChefContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? CHEF_ADDR : undefined, CHEF_ABI, true)
}

export function useLegacyChefContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? `0xa0488F956D7fe05b1798e9FaF0cE5F1133d23822` : undefined, CHEF_ABI, true)
}

export function useStaticSwapContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? STATIC_SWAP_ADDR : undefined, staticSwapAbi, true)
}


export function useClaimContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? `0xC733bE6874366503524122919ecae61ebaA85C5B` : undefined, claimAbi2, true)
}

export function useClaimTwitterContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? `0x4a0B96DDD66C4bb4d7DE6D19eea36df63c74355B` : undefined, claimAbi2, true)
}


export function useFarmData(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? `0xC329Cc2A94C3252042260a607a73CeE6B2FBECB1` : undefined, farmDataAbi, true)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  // return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible)
  return useContract(LP_ADDR, lpTokenArtifact, false)
}

export function useAirdropContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? AIRDROP_ADDRESS[chainId] : undefined, AIRDROP_ABI, true)
}