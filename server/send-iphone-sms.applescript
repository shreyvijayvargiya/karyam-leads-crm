on run argv
	if (count of argv) < 2 then error "Need phone and message"
	set targetPhone to item 1 of argv
	set targetMessage to item 2 of argv

	tell application "Messages"
		activate
		delay 0.4
		try
			set smsAccount to first account whose service type is SMS
			set theBuddy to participant targetPhone of smsAccount
			send targetMessage to theBuddy
			return "ok"
		on error errMsg number errNum
			error "Messages SMS failed (" & errNum & "): " & errMsg & ". Enable iPhone Text Message Forwarding, keep Messages open, and allow Automation for node/osascript."
		end try
	end tell
end run
