import ../libs/karax/karax/karax
import ../libs/karax/karax/karaxdsl
import ../libs/karax/karax/vdom

proc main() =
  setRenderer(proc(): VNode =
    buildHtml(tdiv):
      text "Hello from Karax!"
  )

# proc setupListeners() =
#   document.addEventListener("message", proc (e: Event) =
#     let message = cast[MessageEvent](e)
#     console.log("Received from VS Code:", message.data)
#   )

when isMainModule:
  # setupListeners()
  main()