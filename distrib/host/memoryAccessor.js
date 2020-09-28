// This file is responsible for the MemoryAccessor actor, which handles the direct editing of the memory array created and held by the Memory object.
var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        constructor() { }
        init() { }
        read(address) {
            if (address < MEM_MAXIMUM_SIZE) { // First, check the given address is valid before attempting to retrieve the value.
                return _Memory.memory[address];
            }
            else { // If not valid, return a null.
                return "";
            }
        }
        write(address, value) {
            if (address < MEM_MAXIMUM_SIZE) { // It will only write if the given address is valid, of course.
                _Memory.memory[address] = value;
            }
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map