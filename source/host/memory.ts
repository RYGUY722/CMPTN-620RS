// This class is responsible for the Memory object, which mainly acts as a holder for an Array that is a virtual physical memory device.

module TSOS {

    export class Memory {

        constructor(public memory = new Array(MEM_MAXIMUM_SIZE)) {
        }

        public init(): void {
            for(var i = 0; i < MEM_MAXIMUM_SIZE; i++){
				this.memory[i]="00";
			}
        }
	}
}