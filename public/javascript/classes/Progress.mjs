class Progress{
    constructor(progress) {
        this.progress = progress;
    }
    setProgress(progress){
        this.progress = progress;
    }

    filterProgress(){
        return this.progress.sort((a, b) =>  b.progress-a.progress);
    }
}
export { Progress };