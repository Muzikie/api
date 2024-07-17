export default (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    console.log('Middleware is called', ctx.user);
    // if signing up
    // get the user info
    // create new profile
    // call next
    return next();
  };
};