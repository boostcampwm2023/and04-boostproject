package com.ohdodok.catchytape.core.domain.usecase

import com.ohdodok.catchytape.core.domain.repository.AuthRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class SignUpUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {

    operator fun invoke(googleToken: String, nickname: String): Flow<Unit> =
        authRepository.signUpWithGoogle(googleToken = googleToken, nickname = nickname)
}