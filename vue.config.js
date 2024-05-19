module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/audio-visualiser'
    : '/audio-visualiser',
    devServer: {
      client: {
        overlay: false,
      },
    },
};