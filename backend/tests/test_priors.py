from datetime import time
import math

import numpy as np
import pytest

from app.model.priors import log_prior_h, make_prior
from app.types import User


def user(smoker=False, hormonal_bc=False):
    return User(id=1, name="Test", bedtime=time(23, 30), smoker=smoker, hormonal_bc=hormonal_bc)


@pytest.mark.parametrize("smoker, bc, h0", [
    (False, False, 5.0),
    (True, False, 3.0),
    (False, True, 9.0),
    (True, True, 5.4),   # both multipliers apply
])
def test_h0_for_each_onboarding_answer(smoker, bc, h0):
    prior = make_prior(user(smoker, bc))
    assert math.exp(prior.log_h_mean) == pytest.approx(h0)
    assert prior.log_h_sd == 0.4


def test_default_two_sigma_range():
    prior = make_prior(user())
    low = math.exp(prior.log_h_mean - 2 * prior.log_h_sd)
    high = math.exp(prior.log_h_mean + 2 * prior.log_h_sd)
    assert low == pytest.approx(2.2, abs=0.1) and high == pytest.approx(11, abs=0.2)


def test_weights_prior():
    prior = make_prior(user(smoker=True, hormonal_bc=True))
    np.testing.assert_array_equal(prior.m0, [15, 6, 0])
    np.testing.assert_array_equal(prior.S0, np.diag([100, 36, 25]))


def test_priors_do_not_share_arrays():
    a, b = make_prior(user()), make_prior(user())
    a.m0[0] = 99
    assert b.m0[0] == 15


def test_log_prior_peaks_at_h0_and_is_symmetric_in_log_h():
    prior = make_prior(user(hormonal_bc=True))
    grid = np.geomspace(1.5, 15, 200)
    lp = log_prior_h(grid, prior)
    assert lp.shape == grid.shape
    assert grid[np.argmax(lp)] == pytest.approx(9, rel=0.02)
    np.testing.assert_allclose(log_prior_h(np.array([9 / 2, 9 * 2]), prior), log_prior_h(np.array([9 * 2]), prior)[0])


def test_log_prior_is_a_normalised_density_in_log_h():
    prior = make_prior(user())
    grid = np.geomspace(0.1, 250, 4000)
    d_log_h = np.diff(np.log(grid))[0]
    assert np.exp(log_prior_h(grid, prior)).sum() * d_log_h == pytest.approx(1, abs=1e-3)
