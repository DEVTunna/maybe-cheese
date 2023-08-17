import React, {useCallback, useState} from 'react'
import {AutoColumn} from '../components/Column'
import styled from 'styled-components'
import VideoPlayer from 'react-video-js-player';
import canAutoPlay from 'can-autoplay';
import Cookies from 'js-cookie';
import {isMobile} from 'react-device-detect'
import {RouteComponentProps} from 'react-router-dom'
import Unmute from '../assets/images/unmute.png'
import {RowBetween} from '../components/Row'
import {ButtonPrimary} from '../components/Button'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`


const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({theme}) => theme.mediaWidth.upToSmall`
     flex-direction: column;
     gap: 12px;
   `};
`

const JadeProtocol:React.FC = () => {
    let [muted, setMuted] = useState(true);


    let player;
    let onPlayerReady = async (e, p) => {
        player = e;

        if (isMobile) {
            player.controls(true);
            setMuted(false)
        } else {
            let mutedAuto = (await canAutoPlay.video({timeout: 1000, muted: true})).result;
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


    const onVideoPlay = () => {
        window['_paq'].push(['trackEvent', 'Video', 'Play', '']);
    }

    // const renderer = ({ days, hours, minutes, seconds }) => {
    // return <span>{days}d {hours}h {minutes}m {seconds}s</span>;
    // };


    return (
        <div className="mainThing">
            <div className="newthing">
                <div className="newchild">

                    <div className="videoContainer">
                        {muted && !isMobile &&
                        <img src={Unmute} className="unmuteBtn" onClick={unmute} width="60px"/>
                        }
                        {muted && !isMobile &&
                        <div className="unmuteOverlay" onClick={unmute}/>
                        }
                        <VideoPlayer
                            controls={false}
                            autoplay={false}
                            src='/jade.mp4'
                            poster='/thumb.png'
                            className="vjs-fluid"
                            onReady={onPlayerReady}
                            onPlay={onVideoPlay}
                        />
                        <DataRow style={{marginBottom: '20px', marginTop: '20px', justifyContent: 'center'}}>

                            <ButtonPrimary
                                padding="8px"
                                borderRadius="8px"
                                width="140px"
                                onClick={() => window.open('https://jadeprotocol.io', '_blank')}
                            >
                                Get In Early on $JADE
                            </ButtonPrimary>

                        </DataRow>

                    </div>

                </div>

                <div className="newchild jade">

                    <PageWrapper gap="md" justify="center">
                        <h1 >Want to get in early before our next "Fair Fork"?</h1>
                        <h2>We will post it to Discord before announcing it publicly on social media. Click here to join our discord.</h2>

                        <DataRow style={{marginBottom: '20px', marginTop: '20px', justifyContent: 'center'}}>

                            <ButtonPrimary
                                padding="8px"
                                borderRadius="8px"
                                width="140px"
                                onClick={() => window.open('https://jadeprotocol.io', '_blank')}
                            >
                                Get In Early on $JADE
                            </ButtonPrimary>
                            <ButtonPrimary
                                padding="8px"
                                borderRadius="8px"
                                width="140px"
                                onClick={() => window.open('https://discord.gg/unvPR7kteh', '_blank')}
                            >
                                Join Our Discord
                            </ButtonPrimary>

                        </DataRow>

                    </PageWrapper>
                </div>
            </div>
        </div>
    )
}


export default JadeProtocol;
