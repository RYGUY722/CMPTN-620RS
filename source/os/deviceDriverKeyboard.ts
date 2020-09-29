/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
			var isCtrled = params[2];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
				if(isCtrled && keyCode == 67 && _CPU.isExecuting){
					_Kernel.krnProgramBreak();
				}
                else if (isShifted === true) { 
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode == 32)                      ||   // Special action characters (space)
                        (keyCode == 13)                     ||   // enter
                        (keyCode == 8)                      ||   // backspace
                        (keyCode == 9)                      ||   // tab
                        (keyCode == 38)                     ||   // up
						(keyCode == 40)){                        // down
                chr = String.fromCharCode(keyCode);
				if(keyCode == 38) {
					chr="up";
				}
				else if(keyCode == 40) {
					chr="dn";
				}
                _KernelInputQueue.enqueue(chr);
            }
			else if (((keyCode >= 48) && (keyCode <= 57)))   {   // digits
                chr = String.fromCharCode(keyCode);
				if (isShifted) {
                    switch (keyCode) {
                        case 48: {
                            chr = ')';
                            break;
                        }
                        case 49: {
                            chr = '!';
                            break;
                        }
                        case 50: {
                            chr = '@';
                            break;
                        }
                        case 51: {
                            chr = '#';
                            break;
                        }
                        case 52: {
                            chr = '$';
                            break;
                        }
                        case 53: {
                            chr = '%';
                            break;
                        }
                        case 54: {
                            chr = '^';
                            break;
                        }
                        case 55: {
                            chr = '&';
                            break;
                        }
                        case 56: {
                            chr = '*';
                            break;
                        }
                        case 57: {
                            chr = '(';
                            break;
                        }
                        default: {
                            break;
                        }
                    }
				}
                _KernelInputQueue.enqueue(chr);
			}
			//Special characters
			else if  (((keyCode >= 186) && (keyCode <= 192)) ||   // ;=,-./`
                     ((keyCode >= 219) && (keyCode <= 222))) {   // [\]'
					 if(!isShifted) {
						switch (keyCode) {
							case 186: {
								chr = ';';
								break;
							}
							case 187: {
								chr = '=';
								break;
							}
							case 188: {
								chr = ',';
								break;
							}
							case 189: {
								chr = '-';
								break;
							}
							case 190: {
								chr = '.';
								break;
							}
							case 191: {
								chr = '/';
								break;
							}
							case 192: {
								chr = '`';
								break;
							}
							case 219: {
								chr = '[';
								break;
							}
							case 220: {
								chr = '\\';
								break;
							}
							case 221: {
								chr = ']';
								break;
							}
							case 222: {
								chr = '\'';
								break;
							}
							default: {
								break;
							}
						}
					}
					if(isShifted) {
						switch (keyCode) {
							case 186: {
								chr = ':';
								break;
							}
							case 187: {
								chr = '+';
								break;
							}
							case 188: {
								chr = '<';
								break;
							}
							case 189: {
								chr = '_';
								break;
							}
							case 190: {
								chr = '>';
								break;
							}
							case 191: {
								chr = '?';
								break;
							}
							case 192: {
								chr = '~';
								break;
							}
							case 219: {
								chr = '{';
								break;
							}
							case 220: {
								chr = '|';
								break;
							}
							case 221: {
								chr = '}';
								break;
							}
							case 222: {
								chr = '"';
								break;
							}
							default: {
								break;
							}
						}
					}
                _KernelInputQueue.enqueue(chr);
			}
        } 
    }
}
