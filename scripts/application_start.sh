#!/bin/bash

# Give permission for everything in the express-app directory.
sudo chmod -R 777 /home/bitnami/express-app

# Navigate into our working directory where we have all our github files.
cd /home/bitnami/express-app

# Add npm and node to path.
export NVM_DIR="$HOME/.nvm"	
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # loads nvm	
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # loads nvm bash_completion (node is in path now)

# Install node modules.
npm install

# Start our node app in the background.
node index.js > index.out.log 2> index.err.log < /dev/null & 
