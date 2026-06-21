import { useEffect, useState } from 'react'
import {
	DownloadInstaller,
	GetLatestRelease,
	RemoveVoidPresence,
	RunInstallerUpdater,
	RunNsis,
} from '../../wailsjs/go/installer/Installer'
import { GetInstallPath } from '../../wailsjs/go/installer_paths/Paths'
import { CheckInstallerUpdate } from '../../wailsjs/go/updates/Updates'
import { EventsOn } from '../../wailsjs/runtime/runtime'

export type InstallState = 'idle' | 'running' | 'done'
export type Mode = 'install' | 'remove'

export interface LatestReleaseInfo {
	tag: string
	assetName: string
}

export interface UpdateInfo {
	hasUpdate: boolean
	currentVersion: string
	latestVersion: string
	assetName: string
	assetUrl: string
}

export function useInstaller() {
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
	const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
	const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
	const [isInstallingUpdate, setIsInstallingUpdate] = useState(false)
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
	const [removePath, setRemovePath] = useState<string>('Detecting…')

	useEffect(() => {
		const offDownload = EventsOn('download:progress', (data: any) => {
			const value = typeof data === 'number' ? data : parseInt(String(data), 10)
			if (!isNaN(value)) {
				setProgress(value)
				if (value < 100) {
					setProgressLabel('Downloading application…')
				} else {
					setProgressLabel('Download completed')
				}
			}
		})

		const offInstall = EventsOn('install:progress', (data: any) => {
			if (typeof data === 'string' && data.trim().length > 0) {
				setProgressLabel(data)
			}
		})

		return () => {
			offDownload()
			offInstall()
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

	const fetchUpdateInfo = async () => {
		if (isCheckingUpdate) return
		setIsCheckingUpdate(true)
		try {
			const info = await CheckInstallerUpdate()
			const mapped: UpdateInfo = {
				hasUpdate: info.hasUpdate,
				currentVersion: info.currentVersion,
				latestVersion: info.latestVersion,
				assetName: info.assetName,
				assetUrl: info.assetUrl,
			}
			setUpdateInfo(mapped)
			if (mapped.hasUpdate) {
				setIsUpdateModalOpen(true)
			}
		} catch {
			setUpdateInfo(null)
		} finally {
			setIsCheckingUpdate(false)
		}
	}

	const fetchInstallPath = async () => {
		try {
			const info = await GetInstallPath()
			setRemovePath(info.installPath || 'Unknown path')
		} catch {
			setRemovePath('Unknown path')
		}
	}

	useEffect(() => {
		fetchLatest()
		fetchUpdateInfo()
		fetchInstallPath()
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

	const runUpdateInstallFlow = async () => {
		if (installState === 'running' || isInstallingUpdate) return
		if (!updateInfo || !updateInfo.assetUrl || !updateInfo.assetName) return

		setIsInstallingUpdate(true)
		setStatusLabel('installing')
		setProgress(0)
		setProgressLabel('Starting update…')
		setIsUpdateModalOpen(false)

		try {
			const result = await DownloadInstaller(updateInfo.assetUrl)
			setDownloadPath(result.path)
			setProgressLabel('Download completed')
			await RunInstallerUpdater(result.path)
		} catch {
			setStatusLabel('error')
			setProgressLabel('Update failed')
		} finally {
			setIsInstallingUpdate(false)
		}
	}

	const runRemoveFlow = async () => {
		if (installState === 'running') return

		setStatusLabel('installing')
		setProgressLabel('Starting remove…')

		try {
			await RemoveVoidPresence(removePath)
			setRemoveStatus(`Uninstall completed from: ${removePath}`)
			setStatusLabel('completed')
		} catch {
			setRemoveStatus(`Failed to uninstall from: ${removePath}`)
			setStatusLabel('error')
		}
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
		fetchUpdateInfo()
		fetchInstallPath()
	}

	const statusDotClass =
		statusLabel === 'completed'
			? 'status-dot dot-success'
			: installState === 'running' || isInstallingUpdate
				? 'status-dot dot-warn'
				: statusLabel === 'error'
					? 'status-dot dot-error'
					: 'status-dot'

	const nextButtonLabel =
		mode === 'install' ? (installState === 'running' ? 'Installing…' : 'Install') : 'Remove'

	const hasUpdate = !!updateInfo && updateInfo.hasUpdate
	const overlayOpenAttr = isUpdateModalOpen ? 'true' : 'false'

	return {
		installState,
		mode,
		progress,
		statusLabel,
		progressLabel,
		releaseVersion,
		assetName,
		assetUrl,
		isFetching,
		downloadPath,
		removeStatus,
		updateInfo,
		isCheckingUpdate,
		isInstallingUpdate,
		isUpdateModalOpen,
		statusDotClass,
		nextButtonLabel,
		hasUpdate,
		overlayOpenAttr,
		setModeInstall,
		setModeRemove,
		handleNextClick,
		handleRefreshClick,
		runUpdateInstallFlow,
		setIsUpdateModalOpen,
		removePath,
	}
}
