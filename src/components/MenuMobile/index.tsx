import React, { useRef, useState } from 'react'
import {
	Send,
	BarChart,
	CheckSquare,
	Info,
	Twitter,
} from 'react-feather'
import styled, { keyframes } from 'styled-components'
import { useTranslation } from 'react-i18next'

import {
	MenuItem,
	MenuNavItem,
} from '../StyledMenu'

const MobileContainer = styled.div`
	align-self: center;
`

const ToggleButton = styled.button`
	z-index: 9;
	position: relative;
	background-color: transparent;
	color: white;
	outline: none;
	border: none;
	box-shadow: none;
	font-size: 18px;
	cursor: pointer;
	padding: 4px 12px;
	border-radius: 6px;
	transition: background-color 0.2s;

	:hover,
	:focus {
		background-color: rgba(202, 202, 202, 0.2);
	}
`

const fadeIn = keyframes`
 from {
   opacity: 0;
 }
 to {
   opacity: 1;
 }
`

const NavBackground = styled.div`
	background-color: #212429;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	padding: 68px 20px 48px;
	display: flex;
	justify-content: space-around;
	animation: ${fadeIn} 0.3s forwards;
`

const NavList = styled.div`
	display: flex;
	flex-direction: column;
`

const NavSection = styled.div``



export default function MenuMobile() {

	const { t } = useTranslation()

	const [navOpen, setNavOpen] = useState<boolean>(false)

	return (
		<MobileContainer>
			<ToggleButton onClick={() => setNavOpen(!navOpen)}>Menu</ToggleButton>
			{navOpen && (
				<NavBackground>
					<NavSection>
						<h4>Links &amp; Docs</h4>
						<NavList>
							<MenuItem
								id='link'
								href='https://smartcoin-tokenomics.gitbook.io/smartcoin-tokenomics/'
							>
								<Info size={14} />
								Docs
							</MenuItem>
							<MenuNavItem
								onClick={() => setNavOpen(false)}
								id='link'
								to={'/listings'}
							>
								<BarChart size={14} />
								Charts
							</MenuNavItem>
							<MenuItem
								id='link'
								href='https://paladinsec.co/projects/smartcoin/'
							>
								<CheckSquare size={14} />
								Audit
							</MenuItem>
						</NavList>
					</NavSection>

					<NavSection>
						<h4>Community</h4>
						<NavList>
							<MenuItem id='link' href='https://t.me/smartcoinofficial'>
								<Send size={14} />
								{t('menu.telegram')}
							</MenuItem>
							<MenuItem id='link' href='https://twitter.com/0xSmartCoin'>
								<Twitter size={14} />
								{t('menu.twitter')}
							</MenuItem>
						</NavList>
					</NavSection>
				</NavBackground>
			)}
		</MobileContainer>
	)
}
