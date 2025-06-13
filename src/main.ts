import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const myInput = core.getInput('myInput')
    core.info(`Hello ${myInput}!`)
    
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    core.info(`The event payload: ${payload}`)
    
    core.setOutput('myOutput', `Hello ${myInput}!`)
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`)
  }
}

run()
