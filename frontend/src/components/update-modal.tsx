import { UpdateInfo } from '../hooks/use-installer'

interface UpdateModalProps {
	isOpen: boolean
	overlayOpenAttr: string
	updateInfo: UpdateInfo | null
	isInstallingUpdate: boolean
	installState: string
	setIsUpdateModalOpen: (v: boolean) => void
	runUpdateInstallFlow: () => void
}

export function UpdateModal(props: UpdateModalProps) {
	const {
		isOpen,
		overlayOpenAttr,
		updateInfo,
		isInstallingUpdate,
		installState,
		setIsUpdateModalOpen,
		runUpdateInstallFlow,
	} = props

	return (
		<div id='update-overlay' data-open={overlayOpenAttr}>
			<div className='update-modal'>
				<main className='update-main'>
					<div className='update-inner-scroll'>
						<div className='update-animate'>
							<button
								className='update-back-btn'
								type='button'
								onClick={() => setIsUpdateModalOpen(false)}
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='12'
									height='12'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='m15 18-6-6 6-6'></path>
								</svg>
								<span>Back to installer</span>
							</button>

							<div className='card update-card'>
								<div className='card-header update-card-header'>
									<div>
										<div className='card-title update-title'>
											New version available Installer
										</div>
									</div>
								</div>

								<div className='divider'></div>

								<div className='left-pane update-body-margin'>
									<div className='update-body'>
										<div>
											<div className='update-section-label'>Version</div>
											<div className='update-section-block'>
												<div className='update-row'>
													<span className='update-label'>Current</span>
													<span className='update-value mono'>
														{updateInfo?.currentVersion || 'unknown'}
													</span>
												</div>
												<div className='update-row'>
													<span className='update-label'>Latest</span>
													<span className='update-value mono'>
														{updateInfo?.latestVersion || 'unknown'}
													</span>
												</div>
											</div>
										</div>

										<div>
											<div className='update-section-label'>Installer</div>
											<div className='update-section-block'>
												<div className='update-row'>
													<span className='update-label'>File</span>
													<span className='update-value mono'>
														{updateInfo?.assetName || 'not resolved'}
													</span>
												</div>
											</div>
										</div>

										<div className='update-actions'>
											<button
												type='button'
												className='next-btn'
												onClick={runUpdateInstallFlow}
												disabled={
													isInstallingUpdate ||
													!updateInfo?.assetUrl ||
													installState === 'running'
												}
											>
												<span>
													{isInstallingUpdate
														? 'Updating…'
														: 'Download and install'}
												</span>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}
