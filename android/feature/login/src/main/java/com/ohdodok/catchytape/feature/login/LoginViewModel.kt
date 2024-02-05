package com.ohdodok.catchytape.feature.login

import androidx.lifecycle.viewModelScope
import com.ohdodok.catchytape.core.domain.model.CtErrorType
import com.ohdodok.catchytape.core.domain.model.CtException
import com.ohdodok.catchytape.core.domain.usecase.login.AutomaticallyLoginUseCase
import com.ohdodok.catchytape.core.domain.usecase.login.LoginUseCase
import com.ohdodok.catchytape.core.ui.BaseViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onCompletion
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val automaticallyLoginUseCase: AutomaticallyLoginUseCase
) : BaseViewModel() {
    override suspend fun onError(errorType: CtErrorType) {
        _events.emit(LoginEvent.ShowMessage(errorType))
    }

    private val _events = MutableSharedFlow<LoginEvent>()
    val events = _events.asSharedFlow()

    var isAutoLoginFinished: Boolean = false
        private set

    fun login(token: String) {
        loginUseCase(token).onEach {
            _events.emit(LoginEvent.NavigateToHome)
        }.onCompletion { throwable ->
            if (throwable is CtException) {
                val ctError = throwable.ctError
                if (ctError == CtErrorType.NOT_EXIST_USER || ctError == CtErrorType.WRONG_TOKEN) {
                    _events.emit(LoginEvent.NavigateToNickName(token))
                }
            }
        }.launchIn(viewModelScopeWithExceptionHandler)
    }

    fun automaticallyLogin() {
        viewModelScope.launch(exceptionHandler) {
            val isLoggedIn = automaticallyLoginUseCase()
            if (isLoggedIn) _events.emit(LoginEvent.NavigateToHome)
        }.invokeOnCompletion {
            isAutoLoginFinished = true
        }
    }
}

sealed interface LoginEvent {
    data object NavigateToHome : LoginEvent
    data class NavigateToNickName(val googleToken: String) : LoginEvent
    data class ShowMessage(val error: CtErrorType) : LoginEvent
}