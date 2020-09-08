/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
					public inpHistory:string[] = new Array(),
					public histID = 1,
					public tabList:string[] = new Array(),
					public tabID = -1) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
				//Quick check to see if it's not tab. If tab was the last pressed key, the list needs a quick clearing.
				if (this.tabID != -1 && chr != String.fromCharCode(9)) {
					this.tabID=-1;
					this.tabList = new Array();
				}
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
					// ... and log the input ...
					this.inpHistory.push(this.buffer);
					// ... and set the ID for future use ...
					this.histID = this.inpHistory.length;
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) { //the Backspace key
					if(this.buffer!=""){
						var lastchr = this.buffer.charAt(this.buffer.length-1);
						this.buffer = this.buffer.substring(0,this.buffer.length-1);
						this.removeText(lastchr);
					}
				} else if (chr === String.fromCharCode(38)) { //Up arrow
					if(this.histID<=0){ //If we're as far back as we can recall, empty the buffer and set histID to -1
						this.histID=-1;
						this.removeText(this.buffer);
						this.buffer="";
					}
					else { //Otherwise, go back one index in the input history and set that as the current command
						this.histID--;
						this.removeText(this.buffer);
						this.buffer=this.inpHistory[this.histID];
						this.putText(this.buffer);
					}
				} else if (chr === String.fromCharCode(40)) { //Down arrow
					if(this.histID>=this.inpHistory.length-1){ //If we're as far forward as we can recall, empty the buffer and set histID to inpHistory.length
						this.histID=this.inpHistory.length;
						this.removeText(this.buffer);
						this.buffer="";
					}
					else { //Otherwise, go forward one index in the input history and set that as the current command
						this.histID++;
						this.removeText(this.buffer);
						this.buffer=this.inpHistory[this.histID];
						this.putText(this.buffer);
					}
				} else if (chr === String.fromCharCode(9)) { //Tab is pressed.
					/*Tab should have 2 functions: 
					1) If tab is pressed once, complete the command with whatever matches best.
					2) If tab is pressed in succession, continue down the list of matching commands.
					*/
					if(this.tabID==-1){ //If this is the first tab press, we need to gather matching commands through regex.
						var bufreg = new RegExp("^"+this.buffer);
						for (var i in _OsShell.commandList) {
							if(bufreg.test(_OsShell.commandList[i].command)){
								this.tabList.push(_OsShell.commandList[i].command);
							}
						}
						if(this.tabList.length>0){
							this.tabID=0;
							this.removeText(this.buffer);
							this.buffer=this.tabList[this.tabID];
							this.putText(this.buffer);
						}
					}
					else {//Iterate through the list, looping if we're at the max.
						this.tabID++;
						if(this.tabID>=this.tabList.length) {
							this.tabID=0;
						}
						this.removeText(this.buffer);
						this.buffer=this.tabList[this.tabID];
						this.putText(this.buffer);
					}
				} else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
         }
		 
        public removeText(text): void {
            //This is a copy of the putText, but reversed
            if (text !== "") {
				//Calculate the size of the letter
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                // Move the current X positionto the start of the previous character.
                this.currentXPosition = this.currentXPosition - offset;
                // Draw a clear rectangle over the previous character. This method would leave a tiny black line below the erased characters, so I added an arbitrary amount to the rectangle height. In this environment, there will never be characters below the erased character.
                _DrawingContext.eraseText(this.currentXPosition, (this.currentYPosition-this.currentFontSize), offset, (this.currentFontSize+5)); 
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
			var yChange = _DefaultFontSize + 
                          _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                          _FontHeightMargin;

            // TODO: Handle scrolling. (iProject 1)
			if((this.currentYPosition+yChange)>_Canvas.height){
				var savestate = _DrawingContext.getImageData(0, 0, _Canvas.height, _Canvas.width);
				this.clearScreen();
				_DrawingContext.putImageData(savestate, 0, -yChange);
			}
			else {
				this.currentYPosition += yChange;
			}
        }
    }
 }
