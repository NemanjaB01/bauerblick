package ase_pr_inso_01.user_service.service.impl;

import ase_pr_inso_01.user_service.controller.dto.user.UserCreateDto;
import ase_pr_inso_01.user_service.controller.dto.user.UserDetailsDto;
import ase_pr_inso_01.user_service.controller.dto.user.UserLoginDto;
import ase_pr_inso_01.user_service.exception.ConflictException;
import ase_pr_inso_01.user_service.exception.NotFoundException;
import ase_pr_inso_01.user_service.exception.ValidationException;
import ase_pr_inso_01.user_service.model.User;
import ase_pr_inso_01.user_service.repository.UserRepository;
import ase_pr_inso_01.user_service.security.JwtUtils;
import ase_pr_inso_01.user_service.service.UserService;
import ase_pr_inso_01.user_service.validation.UserValidator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserValidator userValidator;
    private final JwtUtils jwtUtils;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           UserValidator userValidator,
                           JwtUtils jwtUtils) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userValidator = userValidator;
        this.jwtUtils = jwtUtils;
    }


    @Override
    public User createUser(UserCreateDto dto) throws ValidationException, ConflictException {

        userValidator.validateForSignUp(dto);

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());

        // secure password hashing
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setPassword2(passwordEncoder.encode(dto.getPassword2()));

        return userRepository.save(user);
    }

    @Override
    public String login(UserLoginDto dto) throws ConflictException, ValidationException {
        userValidator.validateForLogin(dto.getEmail());

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new NotFoundException(
                        "User not found"
                ));

        String rawPassword = new String(dto.getPassword());

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ValidationException(
                    "Login failed",
                    Map.of("password", "Wrong password")
            );
        }

        return jwtUtils.generateToken(user.getEmail());
    }

    @Override
    public UserDetailsDto getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));


        return new UserDetailsDto(user.getEmail(), user.getFirstName(), user.getLastName());
    }


    public UserDetailsDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        return new UserDetailsDto(user.getEmail(), user.getFirstName(), user.getLastName());
    }
}
