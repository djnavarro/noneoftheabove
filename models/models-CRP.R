# Provides six functions:
#
#    CRP, hCRP
#    gCRP, hgCRP
#    TTR, hTTR
#
# Probability distribution over the assignment of the next observation,
# given the frequency distribution of the previous observations. In all
# cases the only required input is a vector of counts. By default the
# output is simply the probability that the next observation belongs to
# a new category (using the default parameter values). If full=TRUE it
# reports the full probability distribution over the next assignment,
# with the new category as the last element of the output vector. The
# hierarchical models rely on a JAGS implementation of the CRP partition
# probability function. The JAGS models are specified internally here as
# strings, but they aren't pretty. If you want to see the prettier version
# look at the .bug files in this directory. Those don't get called anywhere
# but at least the syntax highlighting works properly!
require(rjags,quietly = TRUE)

# --- vanilla CRP ---
CRP <- function( counts, theta=1, full=FALSE ) {
  
  # counts = vector of frequencies
  # theta = the concentration parameter
  # full = should the function report the full distribution
  
  # compute the full distribution?
  if( full==TRUE ) { 
    prob <- c(counts, theta) / (sum(counts) + theta)
    
  # or just the probability of the next one
  } else {
    prob <- theta / (sum(counts) + theta)
    
  }
  return(prob)
}


# --- generalized CRP ---
gCRP <- function( counts, theta=1, alpha=.1, full=FALSE ) {
  
  # counts = vector of frequencies
  # theta = the concentration parameter
  # alpha = the discount parameter
  # full = should the function report the full distribution
  
  # compute the full distribution?
  if( full==TRUE ) { 
    K <- length(counts)
    prob <- c(counts - alpha, theta + K*alpha) / (sum(counts) + theta)
    
    # or just the probability of the next one
  } else {
    prob <- (theta + length(counts)*alpha) / (sum(counts) + theta)
    
  }
  return(prob)
}

# --- types tokens ratio (theta=0) model ---
TTR <- function( counts, alpha=.1, full=FALSE ) {
  gCRP(counts=counts,theta=0,alpha=alpha,full=full)
}


# --- hierarchical CRP ---
hCRP <- function( counts, shape=2, scale=1, its=1000, full=FALSE ) {

  # counts = vector of frequencies
  # shape = the shape parameter for the Pareto dist (1 = exponential)
  # scale = the scale parameter for the Pareto dist
  # its = number of JAGS iterations
  # full = should the function report the full distribution
  
  # create data structure that JAGS will use
  jagsData <- list(
    n = counts,     # the actual data treated as a "parameter"
    out = 1,        # dummy variable: indicates that "n" was observed
    scale = scale,  # scale parameter
    shape = shape   # shape parameter
  )
  
  # Define the JAGS model (with Pareto prior) as a string.
  jagsModelStringPar <- "
      model {
          # sample theta from Pareto prior
          u ~ dbeta(1,1) 
          theta <- scale * (u^-shape -1)/shape 

          # count the number of types and tokens
          N <- sum(n)
          K <- length(n)

          # compute the probability of the observed partition
          LP <- loggam(theta) - loggam(theta+N) + K*log(theta) + sum(loggam(n))
          P <- exp(LP)

          # dummy
          out ~ dbern(P)
      }"
  
  # Define the JAGS model (with exponential prior) as a string.
  jagsModelStringExp <- "
      model {
          # sample theta from exponential prior
          u ~ dbeta(1,1) 
          theta <- -scale*log(u)

          # count the number of types and tokens
          N <- sum(n)
          K <- length(n)

          # compute the probability of the observed partition
          LP <- loggam(theta) - loggam(theta+N) + K*log(theta) + sum(loggam(n))
          P <- exp(LP)

          # dummy 
          out ~ dbern(P)
      }"
  
  # indicate which model file to use: the JAGS model for
  # exponential special case is set up differently for the
  # other parameterisations of the Pareto distribution.
  jagsModelString <- ifelse(
    test = shape == 0, 
    yes = jagsModelStringExp, 
    no = jagsModelStringPar 
  )
  
  # create JAGS model, and be quiet about it
  jagsModel <- jags.model(
    file = textConnection(jagsModelString), 
    data = jagsData, 
    quiet=TRUE 
  )
  
  # draw samples from the JAGS model, monitoring the theta 
  # parameter in order to obtain the posterior distribution over
  # the concentration parameter, again suppressing the visual
  # progress bar
  samples <- jags.samples(
    model = jagsModel, 
    variable.names = "theta", 
    n.iter = its, 
    progress.bar="none"
  )
  
  # simplify the samples object by pulling out only the relevant
  # bits and converting to a its x 1 size matrix
  theta <- as.matrix( samples[[1]] )
  
  # compute the full distribution over the assignment of the next
  # observation, or just the probability that it will be new. Either
  # way we can pass the "full" argument through to all
  all <- sapply( 
    theta, 
    function( th ) {
      CRP( counts, th, full)
    }
  )
  
  # return results to user
  if( full == TRUE ) {
    prob <- rowMeans(all)
  } else {
    prob <- mean(all)
  }
  return(prob)
 
}
  



# --- hierarchical CRP ---
hgCRP <- function( counts, shape=2, scale=1, beta1=1, beta2=1, its=1000, full=FALSE ) {
  
  # counts = vector of frequencies
  # shape = the shape parameter for the Pareto dist (1 = exponential)
  # scale = the scale parameter for the Pareto dist
  # a = parameter for the beta prior 
  # b = parameter for the beta prior
  # its = number of JAGS iterations
  # full = should the function report the full distribution
  
  # create data structure that JAGS will use
  jagsData <- list(
    n = counts,     # the actual data treated as a "parameter"
    out = 1,        # dummy variable: indicates that "n" was observed
    scale = scale,  # scale parameter
    shape = shape,  # shape parameter
    a = beta1,      # beta parameter 1
    b = beta2       # beta parameter 2
  )
  
  # Define the JAGS model as a string.
  jagsModelString <- "
     model {

       # theta from generalised pareto
       u ~ dbeta(1,1)
       theta <- scale * (u^-shape -1)/shape

       # alpha from a beta distribution
       alpha ~ dbeta(a,b)

       # number of types and tokens
       N <- sum(n)
       K <- length(n)

       # probability of the count vector under a generalized CRP
       LP <- loggam(theta) - loggam(theta+N) + K*log(alpha) + loggam(theta/alpha + K) - loggam(theta/alpha) + sum( loggam(n-alpha) - loggam(1-alpha))
       P <- exp(LP)

       # dummy
       out ~ dbern(P)

     }"
  
  # create JAGS model, and be quiet about it
  jagsModel <- jags.model(
    file = textConnection(jagsModelString), 
    data = jagsData, 
    quiet=TRUE 
  )
  
  # draw samples from the JAGS model, monitoring the theta & alpha
  # parameters in order to obtain the posterior distribution over
  # the concentration parameter, again suppressing the visual
  # progress bar
  samples <- jags.samples(
    model = jagsModel, 
    variable.names = c("theta","alpha"), 
    n.iter = its, 
    progress.bar="none"
  )
  
  # simplify the samples object by pulling out only the relevant
  # bits and converting to a its x 2 matrix
  samples <- cbind( 
    as.matrix( samples$theta ), 
    as.matrix( samples$alpha ) 
  )
  
  # compute the full distribution over the assignment of the next
  # observation, or just the probability that it will be new. Either
  # way we can pass the "full" argument through to all
  all <- apply( 
    samples, 1,
    function( smp ) {
      gCRP( counts, smp[1], smp[2], full)
    }
  )
  
  # return results to user
  if( full == TRUE ) {
    prob <- rowMeans(all)
  } else {
    prob <- mean(all)
  }
  return(prob)
  
}










# --- hierarchical TTR  ---
hTTR <- function( counts, beta1=1, beta2=1, its=1000, full=FALSE ) {
  
  # counts = vector of frequencies
  # shape = the shape parameter for the Pareto dist (1 = exponential)
  # scale = the scale parameter for the Pareto dist
  # a = parameter for the beta prior 
  # b = parameter for the beta prior
  # its = number of JAGS iterations
  # full = should the function report the full distribution
  
  # create data structure that JAGS will use
  jagsData <- list(
    n = counts,     # the actual data treated as a "parameter"
    out = 1,        # dummy variable: indicates that "n" was observed
    a = beta1,      # beta parameter 1
    b = beta2       # beta parameter 2
  )
  
  # Define the JAGS model as a string.
  jagsModelString <- "
  model {
  
  # alpha from a beta distribution
  alpha ~ dbeta(a,b)
  
  # number of types and tokens
  N <- sum(n)
  K <- length(n)
  
  # probability of the count vector under a generalized CRP
  LP <- -loggam(N) + (K-1)*log(alpha) + loggam(K) + sum( loggam(n-alpha) - loggam(1-alpha))
  P <- exp(LP)
  
  # dummy
  out ~ dbern(P)
  
  }"
  
  # create JAGS model, and be quiet about it
  jagsModel <- jags.model(
    file = textConnection(jagsModelString), 
    data = jagsData, 
    quiet=TRUE 
  )
  
  # draw samples from the JAGS model, monitoring the alpha 
  # parameter in order to obtain the posterior distribution over
  # the parameter, again suppressing the visual
  # progress bar
  samples <- jags.samples(
    model = jagsModel, 
    variable.names = "alpha", 
    n.iter = its, 
    progress.bar="none"
  )
  
  # simplify the samples object by pulling out only the relevant
  # bits and converting to a its x 1 size matrix
  alpha <- as.matrix( samples[[1]] )
  
  # compute the full distribution over the assignment of the next
  # observation, or just the probability that it will be new. Either
  # way we can pass the "full" argument through to all
  all <- sapply( 
    alpha, 
    function( al ) {
      TTR( counts, al, full)
    }
  )
  
  # return results to user
  if( full == TRUE ) {
    prob <- rowMeans(all)
  } else {
    prob <- mean(all)
  }
  return(prob)
  
}


