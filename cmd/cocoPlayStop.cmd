cd C:\scala-project\coco
for /f %%i in (RUNNING_PID) do (
  taskkill /pid %%i -f
)

del RUNNING_PID

pause