const { exec } = require('child_process')
const readLine = require('readline')

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

const inquriy = async () => {
  const cmd = await readSyncByRl('Please enter a command (e.g: Tree) ： \n')
	
  return { cmd }
}

/**
 * run command
 */
const runCmd = async cmd => {
  cmd.map(x => execSync(x, { stdio: 'inherit' }))
}


const App = async () => {
	const { cmd } = await inquriy()
	
	const result = await cmd
		|> visitSets
		|> runCmd

	return result
}


App()