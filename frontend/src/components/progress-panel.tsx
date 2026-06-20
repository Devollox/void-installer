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
		releaseVersion,
		isFetching,
		installState,
		handleRefreshClick,
		nextButtonLabel,
		handleNextClick,
	} = props

	return (
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
						disabled={
							isFetching || installState === 'running' || isInstallingUpdate
						}
					>
						↻
					</button>
				</div>
			</div>

			<div className='progress-block'>
				<div className='progress-header'>
					<span>
						{mode === 'install' ? 'install progress' : 'remove progress'}
					</span>
					<span className='progress-percent'>
						{mode === 'install' || isInstallingUpdate ? `${progress}%` : '--'}
					</span>
				</div>
				<div className='progress-bar'>
					<div
						className='progress-fill'
						style={{
							width:
								mode === 'install' || isInstallingUpdate
									? `${progress}%`
									: '0%',
						}}
					/>
				</div>
				<div className='progress-label'>
					{mode === 'install' || isInstallingUpdate
						? progressLabel
						: removeStatus}
				</div>
			</div>

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
