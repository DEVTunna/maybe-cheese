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

export default function MenuCommunity() {
	const nodeCommunity = useRef<HTMLDivElement>()
	const openCommunity = useModalOpen(ApplicationModal.MENU2)
	const toggleCommunity = useToggleModal(ApplicationModal.MENU2)
	const { t } = useTranslation()
	useOnClickOutside(nodeCommunity, openCommunity ? toggleCommunity : undefined)

	return (
		// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
		<StyledMenu className={`linksbtn`} ref={nodeCommunity as any}>
			<StyledMenuButton onClick={toggleCommunity}>Community</StyledMenuButton>

			{openCommunity && (
				<NarrowMenuFlyout>
					<MenuItem id='link' href='https://t.me/smartcoinofficial'>
						<Send size={14} />
						{t('menu.telegram')}
					</MenuItem>
					<MenuItem id='link' href='https://twitter.com/0xSmartCoin'>
						<Twitter size={14} />
						{t('menu.twitter')}
					</MenuItem>
				</NarrowMenuFlyout>
			)}
		</StyledMenu>
	)
}
