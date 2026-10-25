"""M2: the starting guess for a user's parameters, from onboarding answers (§5.1, §7.5).

Half-life h is log-normal around h0, nudged by smoking and contraception; the
multipliers only set the starting point and the data overrides them.
w = (mu, beta, gamma) gets the same weak prior for everyone.
"""
import math

import numpy as np

from app.types import Prior, User

H0 = 5.0              # population half-life, hours
SMOKER = 0.6          # smoking speeds up clearance (CYP1A2 induction)
HORMONAL_BC = 1.8     # hormonal contraception slows it
LOG_H_SD = 0.4        # 2 sd covers about 2.2 to 11 h for the default

# mu: baseline minutes to fall asleep; beta: extra minutes per 100 mg at bedtime;
# gamma: extra minutes per unit of alcohol.
M0 = np.array([15.0, 6.0, 0.0])
S0 = np.diag([10.0 ** 2, 6.0 ** 2, 5.0 ** 2])


def make_prior(user: User) -> Prior:
    h0 = H0
    if user.smoker:
        h0 *= SMOKER
    if user.hormonal_bc:
        h0 *= HORMONAL_BC
    return Prior(log_h_mean=math.log(h0), log_h_sd=LOG_H_SD, m0=M0.copy(), S0=S0.copy())


def log_prior_h(h_grid: np.ndarray, prior: Prior) -> np.ndarray:
    """Log density of Normal(log_h_mean, log_h_sd^2) at log(h), for each h on the grid.

    A density over log h, not h: the posterior grid is log-spaced, so each point
    covers the same width in log h and no Jacobian is needed.
    """
    z = (np.log(h_grid) - prior.log_h_mean) / prior.log_h_sd
    return -0.5 * z ** 2 - math.log(prior.log_h_sd * math.sqrt(2 * math.pi))
