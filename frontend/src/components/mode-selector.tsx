import { InstallState, Mode } from '../hooks/use-installer'

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
	removePath: string
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
		removePath,
		setModeInstall,
		setModeRemove,
	} = props

	const disabled = installState === 'running' || isInstallingUpdate

	return (
		<div className='hb-main-row'>
			<div className='hb-mode-grid'>
				<button
					type='button'
					onClick={setModeInstall}
					disabled={disabled}
					className={
						'hb-mode-card ' + (mode === 'install' ? 'hb-mode-card_active' : 'hb-mode-card_idle')
					}
				>
					<div className='hb-mode-title'>Install</div>
					<div className='hb-mode-sub'>Integrate Void Presence into your Discord client.</div>
				</button>

				<button
					type='button'
					onClick={setModeRemove}
					disabled={disabled}
					className={
						'hb-mode-card ' +
						(mode === 'remove' ? 'hb-mode-card_active hb-mode-card_danger' : 'hb-mode-card_idle')
					}
				>
					<div className='hb-mode-title'>Remove</div>
					<div className='hb-mode-sub'>Selectively uninstall Void Presence.</div>
				</button>
			</div>
		</div>
	)
}
