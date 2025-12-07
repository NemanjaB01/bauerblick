package ase_pr_inso_01.user_service.validation;

import ase_pr_inso_01.user_service.controller.dto.user.UserCreateDto;
import ase_pr_inso_01.user_service.exception.ConflictException;
import ase_pr_inso_01.user_service.exception.NotFoundException;
import ase_pr_inso_01.user_service.exception.ValidationException;
import ase_pr_inso_01.user_service.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class UserValidator {
  private final UserRepository userRepository;
  public UserValidator(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public void validateForLogin(String email) throws ConflictException, ValidationException {
    List<String> validationErrors = new ArrayList<>();
    List<String> conflictErrors = new ArrayList<>();
    if (email.isEmpty()) {
      validationErrors.add("No email given");
    }
    if (userRepository.findByEmail(email) == null) {
      throw new NotFoundException("User with given e-mail was not found!");
    }
    if (!validationErrors.isEmpty()) {
      throw new ValidationException("There were validation errors during login attempt", validationErrors);
    }
    if (!conflictErrors.isEmpty()) {
      throw new ConflictException("There was a conflict during login attempt", conflictErrors);
    }
  }

  public void validateForSignUp(UserCreateDto toCreate) throws ValidationException, ConflictException {
    List<String> validationErrors = new ArrayList<>();
    List<String> conflictErrors = new ArrayList<>();
    if (toCreate.getEmail().isEmpty()) {
      validationErrors.add("No email given");
    } else if (userRepository.existsByEmail(toCreate.getEmail())) {
      conflictErrors.add("User with the given email already exists");
    }
    if (toCreate.getLastName().isEmpty()) {
      validationErrors.add("No last name given");
    }
    if (toCreate.getFirstName().isEmpty()) {
      validationErrors.add("No first name given");
    }
    if (toCreate.getDateOfBirth() == null) {
      validationErrors.add("No date of birth given");
    } else if (toCreate.getDateOfBirth().isAfter(LocalDate.now())) {
      validationErrors.add("The date of the birth can not be in the future");
    }
    if (new String(toCreate.getPassword()).isEmpty()) {
      validationErrors.add("No password given");
    } else if (new String(toCreate.getPassword()).length() < 8) {
      validationErrors.add("Password is too short");
    } else if (!new String(toCreate.getPassword()).matches("(?=.*[A-Z]).*")) {
      validationErrors.add("Password must contain at least one uppercase letter");
    } else if (!new String(toCreate.getPassword()).matches("(?=.*\\d).*")) {
      validationErrors.add("Password must contain at least one number");
    } else if (!new String(toCreate.getPassword()).matches("(?=.*[.,\\-_!\"§$%&/()=?`*+\\\\]).*")) {
      validationErrors.add("Password must contain at least one special character");
    }
    if (!validationErrors.isEmpty()) {
      throw new ValidationException("", validationErrors);
    }
    if (!conflictErrors.isEmpty()) {
      throw new ConflictException("", conflictErrors);
    }

  }
}
