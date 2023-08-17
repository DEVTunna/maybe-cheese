import React, { useCallback, useState } from 'react'
import { AutoColumn } from '../components/Column'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { JSBI, TokenAmount, CurrencyAmount, CAVAX, Token, WAVAX, ChainId } from '@pangolindex/sdk'
import { RouteComponentProps } from 'react-router-dom'
import PaladinLogo from '../assets/images/paladin.svg'

import { RowBetween } from '../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../components/earn/styled'
import { ButtonPrimary, ButtonEmpty, ButtonSecondary } from '../components/Button'
import { useColor } from '../hooks/useColor'
import { useTranslation } from 'react-i18next'

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

export default function Charts(){
 
  return (
    // <PageWrapper gap="lg" justify="center">
        <iframe width={`100%`} height={`500px`} className="chartembed" src="https://chartex.pro/chart?symbol=AVAX_TRADERJOE%3ASMRTr.0x7B7617c7B2236D7871741783caE8BCc222C2e05D&interval=1&theme=dark" />
    // </PageWrapper>
  )
}
