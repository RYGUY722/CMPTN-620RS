module TSOS {

    export class Scheduler {

		constructor(public quantum: number = DEFAULT_QUANTUM,
					public cycleCounter: number = 0,
					public currentIndex: number = 0,
					public mode = "rr") {}
		
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
				this.endProcess(_ResidentList[segment]);
			}
			_MemoryManager.clearSeg(segment);
			_Kernel.krnTrace("Cleared segment " + segment);
		}
		
		public addProcess(pid): void { 
			_LoadedList.push(pid);
			if(_ProcessList[pid].Segment != -1) {
				_ResidentList[_ProcessList[pid].Segment] = pid;
			}
			_ProcessList[pid].State = "waiting";
			_Kernel.krnTrace("Process " + pid + " added");
		}
		
		public endProcess(pid): void {
			_ResidentList[_ProcessList[pid].Segment] = -1;
			_ProcessList[pid].Segment = -1;
			_ProcessList[pid].State = "terminated";
			_ProcessList[pid].completed = true;
			_ProcessList[pid].Location = "Deleted";
			_ProcessList[pid].save();
			
			_LoadedList.splice(_LoadedList.indexOf(pid), 1);
			
			if(pid == _CurrentProcess) {
				_CurrentProcess = -1;
			}
			
			if(_ReadyList.includes(pid)) {
				var val = _ReadyList.dequeue();
				while(val != pid) {
					_ReadyList.enqueue(val);
					val = _ReadyList.dequeue();
				}
			}
			
			if(_Kernel.krnFileIO(9, [".SWAP~"+pid])) { // If there's a swap file on the drive,
				_Kernel.krnFileIO(5, [".SWAP~"+pid]); // Delete it.
			}
			
			_Kernel.krnTrace("Process " + pid + " ended");
		}
		
		public readyProcess(pid): void {
			if(pid>=0){
				_ReadyList.enqueue(pid);
				_ProcessList[pid].State = "ready";
				_Kernel.krnTrace("Process " + pid + " readied");
			}
		}
		
		public nextProcess(): number { // This method finds and returns the next process to run.
			if(!_ReadyList.isEmpty()) { // If the Ready List contains more PIDs, then we need to get the next one.
				if(_CurrentProcess>=0) { // When a process is ended, the Current Process is set to -1. If it isn't ended, it needs to be placed back on the end of the queue.
					_ReadyList.enqueue(_CurrentProcess);
				}
				return _ReadyList.dequeue(); // To get the next queue item, we simply call dequeue.
			}
			else { // If the Ready List is empty, then 1 of 2 cases is true: Either only 1 process is running, or all processes are done.
				if(_CurrentProcess==-1) { // So let's check the Current Process ID to see which it is. If it's -1, then all processes are done, so we need to shutdown.
					_Kernel.krnTrace("All processes complete");
					_CPU.isExecuting = false;
					
				}
				_Kernel.krnTrace("Switching to process " + _CurrentProcess);
				return _CurrentProcess; // We need to have a return value no matter what, so return the current PID to the dispatcher. If it's -1, it will ignore it.
			}
		}
		
		public rollProcess(pid1, pid2) {
			// ROLL OUT PID1
			var prog = _MemoryManager.DMA(_ProcessList[pid1].Segment);
			if(!_Kernel.krnFileIO(9, [".SWAP~"+pid1])) { // If the swap file doesn't exist,
				_Kernel.krnFileIO(6, [".SWAP~"+pid1]); // Make it.
			}
			_Kernel.krnFileIO(7, [".SWAP~"+pid1, prog]); // Then write the program to it.
			
			// ROLL IN PID2
			var newprog = _Kernel.krnFileIO(8, [".SWAP~"+pid2]).toString();
			newprog = newprog.substr(0, MEM_SEGMENT_SIZE);
			_MemoryManager.load(_ProcessList[pid1].Segment, newprog);
			
			// UPDATE THE OTHER INFORMATION
			_ProcessList[pid2].Segment = _ProcessList[pid1].Segment;
			_ProcessList[pid1].Segment = -1;
			_ProcessList[pid2].Location = "Memory";
			_ProcessList[pid1].Location = "Disk";
			_ResidentList[_ProcessList[pid2].Segment] = pid2;
			
		}
		
	}
}