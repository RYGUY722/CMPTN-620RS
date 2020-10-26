module TSOS {

    export class Scheduler {

		constructor(public quantum: number = DEFAULT_QUANTUM,
					public cycleCounter: number = 0,
					public currentIndex: number = 0) {}
		
        public init(): void {}
		
		public isFull(): boolean{
			for(var i=0; i<=MEM_SEGMENTS; i++){
				if(_ReadyList[i]==-1){
					return false;
				}
			}
			return true;
		}
		
		public getNextFreeSeg(): number{
			for(var i=0; i<=MEM_SEGMENTS; i++){
				if(_ReadyList[i]==-1){
					return i;
				}
			}
			return -1;
		}
		
		public addProcess(): void{
			
		}
		
		public endProcess(pid): void{
			_ProcessList[pid].Segment = -1;
			_ProcessList[pid].State = "terminated";
			_ProcessList[pid].completed = false;
			
		}
		
		public nextProcess(): void{
			_Kernel.krnTrace("Switching processes");
			var lastPID = _CurrentProcess;
			for(var i=currentIndex; i!=currentIndex; i++){ //Iterate through the Ready List, starting at the current process, looking for the next process in the list
				if(i>=MEM_SEGMENTS){ // If we're at the end of the list, loop around
					i = 0;
				}
				if(_ReadyList[i]!=-1){ // If the PID in the Ready List isn't -1 (no process), then we found the next process.
					currentIndex = i;
					_CurrentProcess = _ReadyList[i];
				}
			}
			if(_CurrentProcess!=lastPID){ // If the process changed, then we need to context switch.
				_ProcessList[lastPID].save();
				_ProcessList[lastPID].State = "ready";
				_ProcessList[_CurrentProcess].State = "running";
				_CPU.load();
			}
			
		}
		
	}
}