

/*

Expected format for the judge

{
  from: psuede
  content: "Why is it the best?"
  conversation: [
    {
      from: Reaper
      to: psuede
      content: "RG is the best token ever"
    },
    {
      from: psuede
      to: Reaper
      content: "What is RG?"
    },
  ]
}

*/

export async function manageChat(message, redis) {
  console.log(message)
  console.log("manageChat!")

}