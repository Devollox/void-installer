import { Mode } from '../hooks/use-installer'

interface ProgressPanelProps {
	mode: Mode
	isInstallingUpdate: boolean
	progress: number
	progressLabel: string
	removeStatus: string
	releaseVersion: string
	isFetching: boolean
	installState: string
	handleRefreshClick: () => void
	nextButtonLabel: string
	handleNextClick: () => void
}

export function ProgressPanel(props: ProgressPanelProps) {
	const {
		mode,
		isInstallingUpdate,
		progress,
		progressLabel,
		removeStatus,
		installState,
		nextButtonLabel,
		handleNextClick,
	} = props

	const isInstallingApp = mode === 'install' && installState === 'running'
	const showInstallProgress = isInstallingApp || isInstallingUpdate

	return (
		<div className='wrapper-block-progress'>
			{showInstallProgress && (
				<div className='progress-block'>
					<div className='progress-header'>
						<span>install progress</span>
						<span className='progress-percent'>{`${progress}%`}</span>
					</div>
					<div className='progress-bar'>
						<div
							className='progress-fill'
							style={{
								width: `${progress}%`,
							}}
						/>
					</div>
					<div className='progress-label'>{progressLabel}</div>
				</div>
			)}

			<div className='footer-row'>
				<button
					className='next-btn'
					type='button'
					onClick={handleNextClick}
					disabled={installState === 'running' || isInstallingUpdate}
				>
					<span>{nextButtonLabel}</span>
				</button>
			</div>
		</div>
	)
}
