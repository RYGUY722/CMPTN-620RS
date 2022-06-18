var TSOS;
(function (TSOS) {
    class Assembler {
        constructor(Assembly = "", vars = [], code = []) {
            this.Assembly = Assembly;
            this.vars = vars;
            this.code = code;
        }
        translate() {
            this.code = this.Assembly.split(' '); // Splits each command up so each command/target can be examined by itself.
            var disassembly = ""; // As the code is parsed, it will compile the code into machine code.
            var prc = 0; // Keeps track of the number of commands read so far.
            for (let i = 0; i < this.code.length; i++) {
                prc++;
                switch (this.code[i]) {
                    case "LDA": // A9/AD: Loads accumulator with a constant/from memory.
                        i++;
                        if (this.constTest(this.code[i])) {
                            disassembly += "A9 ";
                        }
                        else {
                            disassembly += "AD ";
                        }
                        break;
                    case "STA": // 8D: Stores the value of the accumulator at the target address.
                        disassembly += "8D ";
                        break;
                    case "ADC": // 6D: Adds the value at the target address to the accumulator.
                        disassembly += "6D ";
                        break;
                    case "LDX": // A2/AE: Loads X register with a constant/from memory.
                        i++;
                        if (this.constTest(this.code[i])) {
                            disassembly += "A2 ";
                        }
                        else {
                            disassembly += "AE ";
                        }
                        break;
                    case "LDY": // A0/AC: Loads Y register with a constant/from memory.
                        i++;
                        if (this.constTest(this.code[i])) {
                            disassembly += "A0 ";
                        }
                        else {
                            disassembly += "AC ";
                        }
                        break;
                    case "NOP": // EA: No operation.
                        disassembly += "EA ";
                        break;
                    case "BRK": // 00: Terminates execution.
                        disassembly += "00 ";
                        break;
                    case "CPX": // EC: Compare a byte in memory to the X register. Z=0 if true.
                        disassembly += "EC ";
                        break;
                    case "BNE": // D0: Branch if Z flag is 0.
                        disassembly += "D0 ";
                        break;
                    case "INC": // EE: Increments the value of the byte at the target address.
                        disassembly += "EE ";
                        break;
                    case "SYS": // FF: Calls an interrupt for the next cycle based on the value in the X register.
                        disassembly += "FF ";
                        break;
                    default: // If it's not recognized, 
                        // Check if it's a variable.
                        // If not, return an error.
                        break;
                }
            }
            return disassembly; // Return the compiled code to the shell.
        }
        constTest(test) {
            if (test.charAt(0) == '#') {
                return true;
            }
            return false;
        }
    }
    TSOS.Assembler = Assembler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=assembler.js.map