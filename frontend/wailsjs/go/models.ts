export namespace installer {
	
	export class DownloadResult {
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new DownloadResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	    }
	}
	export class LatestReleaseInfo {
	    tag: string;
	    assetName: string;
	    downloadUrl: string;
	
	    static createFrom(source: any = {}) {
	        return new LatestReleaseInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tag = source["tag"];
	        this.assetName = source["assetName"];
	        this.downloadUrl = source["downloadUrl"];
	    }
	}

}

export namespace installer_paths {
	
	export class InstallPathInfo {
	    installPath: string;
	
	    static createFrom(source: any = {}) {
	        return new InstallPathInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.installPath = source["installPath"];
	    }
	}

}

export namespace updates {
	
	export class ApiLatestInfo {
	    tag: string;
	    assetName: string;
	    downloadUrl: string;
	
	    static createFrom(source: any = {}) {
	        return new ApiLatestInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tag = source["tag"];
	        this.assetName = source["assetName"];
	        this.downloadUrl = source["downloadUrl"];
	    }
	}
	export class UpdateInfo {
	    hasUpdate: boolean;
	    currentVersion: string;
	    latestVersion: string;
	    assetName: string;
	    assetUrl: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.hasUpdate = source["hasUpdate"];
	        this.currentVersion = source["currentVersion"];
	        this.latestVersion = source["latestVersion"];
	        this.assetName = source["assetName"];
	        this.assetUrl = source["assetUrl"];
	    }
	}

}

