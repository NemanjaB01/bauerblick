package ase_pr_inso_01.user_service.service;

import ase_pr_inso_01.user_service.TestContainersConfiguration;
import ase_pr_inso_01.user_service.controller.dto.user.UserCreateDto;
import ase_pr_inso_01.user_service.controller.dto.user.UserEditDto;
import ase_pr_inso_01.user_service.exception.ConflictException;
import ase_pr_inso_01.user_service.exception.ValidationException;
import ase_pr_inso_01.user_service.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class UserServiceImplEditUserTest {

    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;


    @Test
    void shouldEditFirstAndLastNameSuccessfully() throws ValidationException, ConflictException {
        UserCreateDto createDto = new UserCreateDto();
        createDto.setEmail("editname@test.com");
        createDto.setFirstName("Original");
        createDto.setLastName("Name");
        createDto.setPassword("Test123!");
        createDto.setPassword2("Test123!");
        userService.createUser(createDto);

        UserEditDto editDto = new UserEditDto();
        editDto.setFirstName("NewFirst");
        editDto.setLastName("NewLast");

        User updatedUser = userService.editUser("editname@test.com", editDto);

        assertEquals("NewFirst", updatedUser.getFirstName());
        assertEquals("NewLast", updatedUser.getLastName());
    }

    @Test
    void shouldEditPasswordSuccessfully() throws ValidationException, ConflictException {
        UserCreateDto createDto = new UserCreateDto();
        createDto.setEmail("editpass@test.com");
        createDto.setFirstName("Pass");
        createDto.setLastName("User");
        createDto.setPassword("OldPass123!");
        createDto.setPassword2("OldPass123!");
        userService.createUser(createDto);

        UserEditDto editDto = new UserEditDto();
        editDto.setOldPassword("OldPass123!");
        editDto.setNewPassword("NewPass123!");
        User updatedUser = userService.editUser("editpass@test.com", editDto);

        assertTrue(passwordEncoder.matches("NewPass123!", updatedUser.getPassword()));
    }

    @Test
    void shouldFailEditPasswordWithoutOldPassword() throws ValidationException, ConflictException {
        UserCreateDto createDto = new UserCreateDto();
        createDto.setEmail("noold@test.com");
        createDto.setFirstName("Test");
        createDto.setLastName("User");
        createDto.setPassword("OldPass123!");
        createDto.setPassword2("OldPass123!");
        userService.createUser(createDto);

        UserEditDto editDto = new UserEditDto();
        editDto.setOldPassword("");
        editDto.setNewPassword("NewPass123!"); // old password missing

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            userService.editUser("noold@test.com", editDto);
        });

        assertEquals("Current password is required to set a new password", ex.getMessage());
    }
    @Test
    void shouldFailEditUserWithWrongOldPassword() throws ValidationException, ConflictException {
        UserCreateDto createDto = new UserCreateDto();
        createDto.setEmail("editfail@test.com");
        createDto.setFirstName("Test");
        createDto.setLastName("User");
        createDto.setPassword("Correct123!");
        createDto.setPassword2("Correct123!");
        userService.createUser(createDto);

        UserEditDto editDto = new UserEditDto();
        editDto.setOldPassword("WrongOld123!");  // wrong password
        editDto.setNewPassword("NewPass123!");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            userService.editUser("editfail@test.com", editDto);
        });

        assertEquals("Current password is incorrect", ex.getMessage());
    }


}
