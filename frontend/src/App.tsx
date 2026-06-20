import './App.css'
import { Header } from './components/header'
import { ModeSelector } from './components/mode-selector'
import { ProgressPanel } from './components/progress-panel'
import { UpdateModal } from './components/update-modal'
import { useInstaller } from './hooks/use-installer'

function App() {
	const state = useInstaller()

	return (
		<div className='AppRoot'>
			<div className='installer-shell'>
				<Header
					statusLabel={state.statusLabel}
					statusDotClass={state.statusDotClass}
				/>

				<div className='installer-main'>
					<div className='left-pane'>
						<ModeSelector
							mode={state.mode}
							installState={state.installState}
							isInstallingUpdate={state.isInstallingUpdate}
							downloadPath={state.downloadPath}
							removeStatus={state.removeStatus}
							hasUpdate={state.hasUpdate}
							updateInfo={
								state.updateInfo
									? {
											currentVersion: state.updateInfo.currentVersion,
											latestVersion: state.updateInfo.latestVersion,
										}
									: null
							}
							removePath={state.removePath}
							setModeInstall={state.setModeInstall}
							setModeRemove={state.setModeRemove}
						/>

						<ProgressPanel
							mode={state.mode}
							isInstallingUpdate={state.isInstallingUpdate}
							progress={state.progress}
							progressLabel={state.progressLabel}
							removeStatus={state.removeStatus}
							releaseVersion={state.releaseVersion}
							isFetching={state.isFetching}
							installState={state.installState}
							handleRefreshClick={state.handleRefreshClick}
							nextButtonLabel={state.nextButtonLabel}
							handleNextClick={state.handleNextClick}
						/>
					</div>
				</div>

				<UpdateModal
					isOpen={state.isUpdateModalOpen}
					overlayOpenAttr={state.overlayOpenAttr}
					updateInfo={state.updateInfo}
					isInstallingUpdate={state.isInstallingUpdate}
					installState={state.installState}
					setIsUpdateModalOpen={state.setIsUpdateModalOpen}
					runUpdateInstallFlow={state.runUpdateInstallFlow}
				/>
			</div>
		</div>
	)
}

export default App
