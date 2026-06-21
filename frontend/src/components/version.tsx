import { Mode } from '../hooks/use-installer'

interface VersionProps {
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

export function Version(props: VersionProps) {
	const { isInstallingUpdate, releaseVersion, isFetching, installState, handleRefreshClick } = props

	return (
		<div>
			<div className='release-row'>
				<div className='field-label'>release</div>
				<div className='field-input-row'>
					<input
						className='mono'
						readOnly
						value={releaseVersion === 'Detecting…' ? 'Detecting latest…' : releaseVersion}
					/>
					<button
						className='ghost-btn'
						type='button'
						onClick={handleRefreshClick}
						disabled={isFetching || installState === 'running' || isInstallingUpdate}
					>
						↻
					</button>
				</div>
			</div>
		</div>
	)
}
