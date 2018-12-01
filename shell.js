const {
  execSync
} = require('child_process')
const readLine = require('readline')

const compose = (...funcs) =>
  funcs.reduce((a, b) => (...args) => a(b(...args)), arg => arg)

const readSyncByRl = (tips = '>>> ') => new Promise(res => {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(tips, answer => {
    rl.close()
    res(answer.trim())
  })
})

const visitSets = cmd => {
  const visitors = {
    tree: "tree -I 'README.md|shell.js|scripts'",
    push: "node ./scripts/push"
  }

  return visitors[cmd]
}

const inquriy = async () => {
  const cmd = await readSyncByRl('Please enter a command (e.g: tree | push) ： \n')

  return {
    cmd
  }
}

/**
 * run command
 */
const runCmd = async cmd => execSync(cmd, {
  stdio: 'inherit'
})


const App = async () => {
  const {
    cmd
  } = await inquriy()

  const result = await compose(
    runCmd, visitSets
  )(cmd)

  return result
}


App()