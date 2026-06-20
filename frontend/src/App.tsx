import { useEffect, useState } from 'react'
import {
  DownloadInstaller,
  GetLatestRelease,
  RunNsis,
} from '../wailsjs/go/main/Installer'
import { EventsOn, Quit, WindowMinimise } from '../wailsjs/runtime'
import './App.css'

type InstallState = 'idle' | 'running' | 'done'
type Mode = 'install' | 'remove'

interface LatestReleaseInfo {
  tag: string
  assetName: string
}

const REMOVE_PATH =
  'C:\\Users\\Devollox\\AppData\\Local\\Programs\\voidpresence'

function App() {
  const [installState, setInstallState] = useState<InstallState>('idle')
  const [mode, setMode] = useState<Mode>('install')
  const [progress, setProgress] = useState(0)
  const [statusLabel, setStatusLabel] = useState('ready')
  const [progressLabel, setProgressLabel] = useState('Idle')
  const [releaseVersion, setReleaseVersion] = useState<string>('Detecting…')
  const [assetName, setAssetName] = useState<string | null>(null)
  const [assetUrl, setAssetUrl] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [downloadPath, setDownloadPath] = useState<string | null>(null)
  const [removeStatus, setRemoveStatus] = useState<string>('Idle')

  useEffect(() => {
    const off = EventsOn('download:progress', (data: any) => {
      const value = typeof data === 'number' ? data : parseInt(String(data), 10)
      if (!isNaN(value)) {
        setProgress(value)
        if (value < 100) {
          setProgressLabel('Downloading installer…')
        } else {
          setProgressLabel('Download completed')
        }
      }
    })
    return () => {
      off()
    }
  }, [])

  const fetchLatest = async () => {
    if (isFetching) return
    setIsFetching(true)
    setStatusLabel('ready')
    try {
      const info: LatestReleaseInfo = await GetLatestRelease()
      setReleaseVersion(info.tag || 'unknown')
      setAssetName(info.assetName)
      const url = `https://github.com/Devollox/void-presence/releases/download/${info.tag}/${info.assetName}`
      setAssetUrl(url)
    } catch {
      setReleaseVersion('error')
      setStatusLabel('error')
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchLatest()
  }, [])

  const setModeInstall = () => {
    if (installState === 'running') return
    setMode('install')
  }

  const setModeRemove = () => {
    if (installState === 'running') return
    setMode('remove')
  }

  const runInstallFlow = async () => {
    if (installState === 'running') return
    if (!assetUrl || !assetName) {
      setStatusLabel('error')
      setProgressLabel('Release not resolved')
      return
    }
    setInstallState('running')
    setStatusLabel('installing')
    setProgress(0)
    setProgressLabel('Starting…')
    setRemoveStatus('Idle')
    try {
      const result = await DownloadInstaller(assetUrl)
      setDownloadPath(result.path)
      setProgressLabel('Download completed')
      await RunNsis(result.path)
      setProgress(100)
      setProgressLabel('Completed')
      setStatusLabel('completed')
      setInstallState('done')
    } catch {
      setStatusLabel('error')
      setProgressLabel('Failed')
      setInstallState('idle')
    }
  }

  const runRemoveFlow = async () => {
    if (installState === 'running') return
    setRemoveStatus(`Expected uninstall from: ${REMOVE_PATH}`)
    setStatusLabel('ready')
  }

  const handleNextClick = () => {
    if (mode === 'install') {
      runInstallFlow()
    } else {
      runRemoveFlow()
    }
  }

  const handleRefreshClick = () => {
    fetchLatest()
  }

  const statusDotClass =
    statusLabel === 'completed'
      ? 'status-dot dot-success'
      : installState === 'running'
        ? 'status-dot dot-warn'
        : statusLabel === 'error'
          ? 'status-dot dot-error'
          : 'status-dot'

  const nextButtonLabel =
    mode === 'install'
      ? installState === 'running'
        ? 'Installing…'
        : 'Install'
      : 'Remove'

  return (
    <div className='AppRoot'>
      <div className='installer-shell'>
        <div className='header-row'>
          <div className='header-content'>
            <div className='header-brand'>
              <span className='brand-installer-tag'>Void Presence</span>
            </div>
            <div className='header-center'>
              <div className='status-chip'>
                <div className={statusDotClass}></div>
                <span>{statusLabel}</span>
              </div>
            </div>
            <div className='header-right-side'>
              <div className='window-controls'>
                <button
                  className='win-btn'
                  onClick={() => WindowMinimise()}
                  title='Minimize'
                  type='button'
                >
                  <svg
                    width='10'
                    height='1'
                    viewBox='0 0 10 1'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <line
                      y1='0.5'
                      x2='10'
                      y2='0.5'
                      stroke='currentColor'
                      strokeWidth='1'
                    />
                  </svg>
                </button>
                <button
                  className='win-btn close-btn'
                  onClick={() => Quit()}
                  title='Close'
                  type='button'
                >
                  <svg
                    width='9'
                    height='9'
                    viewBox='0 0 9 9'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M1 1L8 8M8 1L1 8'
                      stroke='currentColor'
                      strokeWidth='1'
                      strokeLinecap='round'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='installer-main'>
          <div className='left-pane'>
            <div className='soft-panel'>
              <p className='meta'>
                Install path: <span className='mono'>{REMOVE_PATH}</span>
              </p>
              {mode === 'install' && downloadPath && (
                <p className='meta meta-remove'>
                  Installer downloaded to:{' '}
                  <span className='mono'>{downloadPath}</span>
                </p>
              )}
              {mode === 'remove' && removeStatus !== 'Idle' && (
                <p className='meta meta-remove'>{removeStatus}</p>
              )}
            </div>

            <div className='segments-row segments-row-centered'>
              <button
                type='button'
                className={
                  'segment-btn segment-btn-large ' +
                  (mode === 'install' ? 'segment-btn-active' : '')
                }
                onClick={setModeInstall}
                disabled={installState === 'running'}
              >
                <span>Install</span>
                <span className='segment-sub'>
                  Download and run latest installer
                </span>
              </button>
              <button
                type='button'
                className={
                  'segment-btn segment-btn-large segment-btn-danger ' +
                  (mode === 'remove' ? 'segment-btn-active' : '')
                }
                onClick={setModeRemove}
                disabled={installState === 'running'}
              >
                <span>Remove</span>
                <span className='segment-sub'>
                  Remove existing Void Presence
                </span>
              </button>
            </div>

            <div>
              <div className='release-row'>
                <div className='field-label'>release</div>
                <div className='field-input-row'>
                  <input
                    className='mono'
                    readOnly
                    value={
                      releaseVersion === 'Detecting…'
                        ? 'Detecting latest…'
                        : releaseVersion
                    }
                  />
                  <button
                    className='ghost-btn'
                    type='button'
                    onClick={handleRefreshClick}
                    disabled={isFetching || installState === 'running'}
                  >
                    ↻
                  </button>
                </div>
              </div>

              <div className='progress-block'>
                <div className='progress-header'>
                  <span>
                    {mode === 'install'
                      ? 'install progress'
                      : 'remove progress'}
                  </span>
                  <span className='progress-percent'>
                    {mode === 'install' ? `${progress}%` : '--'}
                  </span>
                </div>
                <div className='progress-bar'>
                  <div
                    className='progress-fill'
                    style={{
                      width: mode === 'install' ? `${progress}%` : '0%',
                    }}
                  />
                </div>
                <div className='progress-label'>
                  {mode === 'install' ? progressLabel : removeStatus}
                </div>
              </div>

              <div className='footer-row'>
                <button
                  className='next-btn'
                  type='button'
                  onClick={handleNextClick}
                  disabled={installState === 'running' && mode === 'install'}
                >
                  <span>{nextButtonLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
