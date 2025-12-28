package ase_pr_inso_01.user_service.controller;

import ase_pr_inso_01.user_service.controller.dto.user.UserCreateDto;
import ase_pr_inso_01.user_service.controller.dto.user.UserDetailsDto;
import ase_pr_inso_01.user_service.exception.ConflictException;
import ase_pr_inso_01.user_service.exception.ValidationException;
import ase_pr_inso_01.user_service.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping(value = "/api/users")
public class UserController {
  private final UserService userService;
  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping
  public void createUser(@RequestBody UserCreateDto user) throws ValidationException, ConflictException {
    //LOGGER.info("POST /api/users {}", user);
    userService.createUser(user);
  }

    // GET /api/users/{userId}
    @GetMapping("/{userId}")
    public ResponseEntity<UserDetailsDto> getUser(@PathVariable String userId) {
        UserDetailsDto userDto = userService.getUserById(userId);
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/by-email/{email}")
    public ResponseEntity<UserDetailsDto> getUserByEmail(@PathVariable String email) {
        UserDetailsDto userDto = userService.getUserByEmail(email);
        return ResponseEntity.ok(userDto);
    }
  @GetMapping("/me")
  public ResponseEntity<UserDetailsDto> getCurrentUser(Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(401).build();
    }

    String email = principal.getName();

    UserDetailsDto user = userService.getUserByEmail(email);

    return ResponseEntity.ok(user);
  }
}
