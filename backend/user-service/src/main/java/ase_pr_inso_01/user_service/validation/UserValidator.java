package ase_pr_inso_01.user_service.validation;

import ase_pr_inso_01.user_service.controller.dto.user.UserCreateDto;
import ase_pr_inso_01.user_service.exception.ConflictException;
import ase_pr_inso_01.user_service.exception.NotFoundException;
import ase_pr_inso_01.user_service.exception.ValidationException;
import ase_pr_inso_01.user_service.repository.UserRepository;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class UserValidator {
  private final UserRepository userRepository;
  public UserValidator(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public void validateForLogin(String email) throws ValidationException {
    Map<String, String> validationErrors = new HashMap<>();
    if (email.isEmpty()) {
      validationErrors.put("email", "No email given");
    }
    if (userRepository.findByEmail(email) == null) {
      throw new NotFoundException("User with given e-mail was not found!");
    }
    if (!validationErrors.isEmpty()) {
      throw new ValidationException("Validation failed", validationErrors);
    }
  }

  public void validateForSignUp(UserCreateDto toCreate) throws ValidationException, ConflictException {
    Map<String, String> validationErrors = new HashMap<>();
    Map<String, String> conflictErrors = new HashMap<>();
    if (toCreate.getEmail().isEmpty()) {
      validationErrors.put("email", "No email given");
    } else if (userRepository.existsByEmail(toCreate.getEmail())) {
      conflictErrors.put("email", "User with the given email already exists");
    }
    if (toCreate.getLastName().isEmpty()) {
      validationErrors.put("lastName", "No last name given");
    }
    if (toCreate.getFirstName().isEmpty()) {
      validationErrors.put("firstName", "No first name given");
    }

    if (new String(toCreate.getPassword()).isEmpty()) {
      validationErrors.put("password", "No password given");
    } else if (new String(toCreate.getPassword()).length() < 8) {
      validationErrors.put("password", "Password is too short");
    } else if (!new String(toCreate.getPassword()).matches("(?=.*[A-Z]).*")) {
      validationErrors.put("password", "Password must contain at least one uppercase letter");
    } else if (!new String(toCreate.getPassword()).matches("(?=.*\\d).*")) {
      validationErrors.put("password", "Password must contain at least one number");
    } else if (!new String(toCreate.getPassword()).matches("(?=.*[.,\\-_!\"§$%&/()=?`*+\\\\]).*")) {
      validationErrors.put("password", "Password must contain at least one special character");
    }

    if (new String(toCreate.getPassword2()).isEmpty()) {
      validationErrors.put("password2", "No password given");
    } else if (new String(toCreate.getPassword2()).length() < 8) {
      validationErrors.put("password2", "Password is too short");
    } else if (!new String(toCreate.getPassword2()).matches("(?=.*[A-Z]).*")) {
      validationErrors.put("password2", "Password must contain at least one uppercase letter");
    } else if (!new String(toCreate.getPassword2()).matches("(?=.*\\d).*")) {
      validationErrors.put("password2", "Password must contain at least one number");
    } else if (!new String(toCreate.getPassword2()).matches("(?=.*[.,\\-_!\"§$%&/()=?`*+\\\\]).*")) {
      validationErrors.put("password2", "Password must contain at least one special character");
    }
    if(!toCreate.getPassword().equals(toCreate.getPassword2())) {
      validationErrors.put("password2", "Password not matching");
    }
    if (!validationErrors.isEmpty()) {
      throw new ValidationException("Validation failed", validationErrors);
    }
    if (!conflictErrors.isEmpty()) {
      throw new ConflictException("Validation failed", conflictErrors);
    }

  }
}
