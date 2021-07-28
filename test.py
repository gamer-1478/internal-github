x = 0
import time
import sys
while x!=3:
    x = x+1
    sys.stdout.write("running for the "+str(x)+" th time, After 1000Secs\n")
    #print("running for the",x,"th time, After 1000Secs")
    time.sleep(1)
    