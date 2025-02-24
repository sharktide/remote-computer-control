#Persistent  
SetTimer, ReadInputFile, 100

ReadInputFile:
{
    tempDir := A_Temp
    
    tempFilePath := tempDir . "\ahk_input.txt"

    FileRead, input, % tempFilePath

    if (input != "") {
        Send, % input  ; Send the data (e.g., congruency symbol, etc.)
        FileDelete, % tempFilePath  ; Delete the temp file after sending
    }
    return
}
/*
   Copyright 2025 Rihaan Meher & Max Hall

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/