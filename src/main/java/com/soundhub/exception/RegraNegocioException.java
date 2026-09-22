package com.soundhub.exception;

/** 400 - requisicao valida no formato, mas que quebra alguma regra de negocio. */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
