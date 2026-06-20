import { InstallState, Mode, REMOVE_PATH } from '../hooks/use-installer'

interface ModeSelectorProps {
	mode: Mode
	installState: InstallState
	isInstallingUpdate: boolean
	downloadPath: string | null
	removeStatus: string
	hasUpdate: boolean
	updateInfo: {
		currentVersion: string
		latestVersion: string
	} | null
	setModeInstall: () => void
	setModeRemove: () => void
}

export function ModeSelector(props: ModeSelectorProps) {
	const {
		mode,
		installState,
		isInstallingUpdate,
		downloadPath,
		removeStatus,
		hasUpdate,
		updateInfo,
		setModeInstall,
		setModeRemove,
	} = props

	return (
		<>
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
				{hasUpdate && (
					<p className='meta meta-remove'>
						Update available:{' '}
						<span className='mono'>
							{updateInfo?.currentVersion} → {updateInfo?.latestVersion}
						</span>
					</p>
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
					disabled={installState === 'running' || isInstallingUpdate}
				>
					<span>Install</span>
					<span className='segment-sub'>Download and run latest installer</span>
				</button>
				<button
					type='button'
					className={
						'segment-btn segment-btn-large segment-btn-danger ' +
						(mode === 'remove' ? 'segment-btn-active' : '')
					}
					onClick={setModeRemove}
					disabled={installState === 'running' || isInstallingUpdate}
				>
					<span>Remove</span>
					<span className='segment-sub'>Remove existing Void Presence</span>
				</button>
			</div>
		</>
	)
}
