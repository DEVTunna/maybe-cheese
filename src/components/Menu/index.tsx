import React, { useRef } from 'react'
import {
  MessageCircle,
  Send,
  BarChart,
  CheckSquare,
  Info,
  Twitter,
  GitHub,
  Book,
  Calendar,
} from 'react-feather'
import styled from 'styled-components'
import { ReactComponent as MenuIcon } from '../../assets/images/menu.svg'
import { LANDING_PAGE } from '../../constants'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'

import {
  StyledMenu,
  StyledMenuButton,
  MenuFlyout,
  MenuItem,
  MenuNavItem,
} from '../StyledMenu'

import { useTranslation } from 'react-i18next'

const TutorialPage = LANDING_PAGE + 'tutorials'

const StyledMenuIcon = styled(MenuIcon)`
	path {
		stroke: ${({ theme }) => theme.text1};
	}
`

const NarrowMenuFlyout = styled(MenuFlyout)`
	min-width: 8.125rem;
`

export default function Menu() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.MENU)
  const toggle = useToggleModal(ApplicationModal.MENU)
  const { t } = useTranslation()
  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu className={`linksbtn`} ref={node as any}>
      <StyledMenuButton onClick={toggle}>Links &amp; Docs</StyledMenuButton>

      {open && (
        <NarrowMenuFlyout>
          <MenuItem
            id='link'
            href='https://smartcoin-tokenomics.gitbook.io/smartcoin-tokenomics/'
          >
            <Info size={14} />
            Docs
          </MenuItem>
          <MenuItem
            id='link'
            href='https://geckoterminal.com/avax/pools/0x7b7617c7b2236d7871741783cae8bcc222c2e05d'
          >
            <BarChart size={14} />
            Charts
          </MenuItem>
          <MenuItem id='link' href='https://paladinsec.co/projects/smartcoin/'>
            <CheckSquare size={14} />
            Audit
          </MenuItem>
        </NarrowMenuFlyout>
      )}
    </StyledMenu>
  )
}
