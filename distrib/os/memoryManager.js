var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() { }
        init() { }
        load(code, segment) {
            var startByte = this.translateAddress(segment, 0);
            for (let i = 0; i < code.length; i += 2) { // Write the user code into memory, byte by byte (yes, bytes are still 2 characters).
                _MemoryAccessor.write((startByte + i / 2), (code.charAt(i) + code.charAt(i + 1)));
            }
        }
        clear() {
            _Memory.init();
        }
        clearSeg(segment) {
            var base = this.translateAddress(segment, 0);
            var limit = (base + MEM_SEGMENT_SIZE);
            if (segment <= MEM_SEGMENTS) {
                for (var i = base; i <= limit; i++) {
                    _MemoryAccessor.write(i, "00");
                }
            }
        }
        read(segment, address) {
            if (address < 0 || address >= MEM_SEGMENT_SIZE) { // If the address is negative or somehow above the segment size, it is in violation of the access policy.
                _Kernel.krnTrace("Memory Access Violation!");
                _Scheduler.endProcess(_CurrentProcess); // Only the currently running process could commit an access violation. As you said, it should be ended immediately.
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SCHEDULER_IRQ, null)); // The scheduler will now need to find another process to run.
                return "00"; // Return a dummy value, since we have to return something.
            }
            return _MemoryAccessor.read(this.translateAddress(segment, address));
        }
        write(segment, address, value) {
            if (address < 0 || address >= MEM_SEGMENT_SIZE) { // If the address is negative or somehow above the segment size, it is in violation of the access policy.
                _Kernel.krnTrace("Memory Access Violation!");
                _Scheduler.endProcess(_CurrentProcess); // Only the currently running process could commit an access violation. As you said, it should be ended immediately.
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SCHEDULER_IRQ, null)); // The scheduler will now need to find another process to run.
            }
            else {
                _MemoryAccessor.write(this.translateAddress(segment, address), value);
            }
        }
        translateAddress(segment, address) {
            return (segment * MEM_SEGMENT_SIZE) + address;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map