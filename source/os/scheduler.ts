module TSOS {

    export class Scheduler {

		constructor(public quantum: number = 3) {}
		
        public init(): void {}
		
		public isFull(): boolean{
			for(var i=0; i<=MEM_SEGMENTS; i++){
				if(_ReadyList[i]==-1){
					return false;
				}
			}
			return true;
		}
		
		public getNextSeg(): number{
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
			
		}
		
	}
}