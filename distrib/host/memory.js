// This class is responsible for the Memory object, which mainly acts as a holder for an Array that is a virtual physical memory device.
var TSOS;
(function (TSOS) {
    class Memory {
        constructor(memory = new Array(MEM_MAXIMUM_SIZE)) {
            this.memory = memory;
        }
        init() {
            for (var i = 0; i < MEM_MAXIMUM_SIZE; i++) {
                this.memory[i] = "00";
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map