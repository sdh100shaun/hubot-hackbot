echo "Starting deploy..."

[ -z "$TRAVIS_BUILD_NUMBER" ] && echo "TRAVIS_BUILD_NUMBER not set" && exit 1
[ -z "$TRAVIS_COMMIT" ] && echo "TRAVIS_COMMIT not set" && exit 1
[ -z "$GH_TOKEN" ] && echo "GH_TOKEN not set" && exit 1
[ -z "$GH_REF" ] && echo "GH_REF not set" && exit 1

rm -rf deploy
git clone https://${GH_REF} --branch=master --single-branch deploy

(
  cd deploy
  
  npm install TechNottingham/hubot-hackbot#master --save

  git config user.name "Travis-CI"
  git config user.email "david.p.wood+travis@gmail.com"
  git add -A
  git commit -m "Deploy hubot-hackbot build ${TRAVIS_BUILD_NUMBER} (commit ${TRAVIS_COMMIT})"
  git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" staging > /dev/null 2>&1
)