package ase_pr_inso_01.user_service.service;

import ase_pr_inso_01.user_service.controller.dto.user.UserCreateDto;
import ase_pr_inso_01.user_service.controller.dto.user.UserDetailsDto;
import ase_pr_inso_01.user_service.controller.dto.user.UserLoginDto;
import ase_pr_inso_01.user_service.exception.ConflictException;
import ase_pr_inso_01.user_service.exception.ValidationException;
import ase_pr_inso_01.user_service.model.User;

public interface UserService {
  User createUser(UserCreateDto dto) throws ValidationException, ConflictException;

  String login(UserLoginDto dto) throws ConflictException, ValidationException;

    UserDetailsDto getUserByEmail(String email);

    UserDetailsDto getUserById(String userId);
}
