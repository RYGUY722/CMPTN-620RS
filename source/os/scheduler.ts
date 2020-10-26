module TSOS {

    export class Scheduler {

		constructor(public quantum: number = DEFAULT_QUANTUM,
					public cycleCounter: number = 0,
					public currentIndex: number = 0) {}
		
        public init(): void {
			_ResidentList.fill(-1);
		}
		
		public isFull(): boolean {
			for(var i=0; i<=MEM_SEGMENTS; i++){
				if(_ResidentList[i]==-1){
					return false;
				}
			}
			return true;
		}
		
		public getNextFreeSeg(): number {
			for(var i=0; i<=MEM_SEGMENTS; i++){
				if(_ResidentList[i]==-1){
					return i;
				}
			}
			return -1;
		}
		
		public freeSeg(segment): void {
			if(_ResidentList[segment] != -1) {
				_ProcessList[_ResidentList[segment]].State = "terminated";
			}
			_ResidentList[segment] = -1;
			_MemoryManager.clearSeg(segment);
		}
		
		public addProcess(pid): void { 
			_ResidentList[_ProcessList[pid].Segment] = pid;
			_ProcessList[pid].State = "waiting";
		}
		
		public endProcess(pid): void {
			_ResidentList[_ProcessList[pid].Segment] = -1;
			_ProcessList[pid].Segment = -1;
			_ProcessList[pid].State = "terminated";
			_ProcessList[pid].completed = true;
			_ProcessList[pid].save();
			
		}
		
		public readyProcess(pid): void {
			_ReadyList.push(pid);
			_ProcessList[pid].State = "ready";
		}
		
		public nextProcess(): number { // This method finds and returns the next process to run.
			for(var i=this.currentIndex; i!=this.currentIndex; i++){ //Iterate through the Ready List, starting at the current process, looking for the next process in the list
				if(i>=_ReadyList.length){ // If we're at the end of the list, loop around
					i = 0;
				}
				if(_ReadyList[i]!=-1){ // If the PID in the Ready List isn't -1 (no process), then we found the next process.
					this.currentIndex = i;
					return _ReadyList[i];
				}
			}
			return _ReadyList[currentIndex];
		}
		
	}
}